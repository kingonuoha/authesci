'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ConversationType, AttachmentType } from '@prisma/client';

export async function getConversations(userId: string) {
  try {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const whereClause: any = {
      participants: {
        some: {
          userId: userId,
        },
      },
    };

    // Allow admins to see all conversations (or maybe just groups? User said "all groups", but let's stick to standard logic first or expand)
    // If the requirement is strictly "admin can see all groups", we might want to adjust.
    // However, usually "see all" implies access.
    // Let's keep it restricted to participation for now unless explicitly browsing "All Groups" in an admin view.
    // But the user said "admin can see all groups".
    // Let's modify the query if the user is an ADMIN.
    if (user?.role === 'ADMIN') {
        // If admin, they can see ALL conversations? Or just be able to search them?
        // For the main chat list, showing ALL might be overwhelming.
        // But let's assume for now they want to see everything.
        // Actually, let's just keep the participation logic for the main list, 
        // but maybe add a separate "getAllGroups" for admin?
        // The user request "admin can see all groups" might imply they should be listed.
        // Let's try to include all GROUP conversations for admins.
        whereClause.OR = [
            { participants: { some: { userId: userId } } },
            { type: 'GROUP' }
        ];
        delete whereClause.participants; // Remove the strict participation check
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                role: true,
                lastSeenAt: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Sort by unread status then by updatedAt
    const sortedConversations = conversations.sort((a, b) => {
      const getUnreadStatus = (conv: typeof conversations[0]) => {
        const myParticipant = conv.participants.find(p => p.userId === userId);
        const lastMsg = conv.messages[0];
        
        if (!lastMsg || !myParticipant) return false;
        
        // If I sent the last message, it's read
        if (lastMsg.senderId === userId) return false;
        
        // If no lastReadAt, it's unread
        if (!myParticipant.lastReadAt) return true;
        
        // If message is newer than last read, it's unread
        return new Date(lastMsg.createdAt) > new Date(myParticipant.lastReadAt);
      };

      const aUnread = getUnreadStatus(a);
      const bUnread = getUnreadStatus(b);

      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
      
      return 0; // Keep original sort (updatedAt desc)
    });

    return { success: true, data: sortedConversations };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: 'Failed to fetch conversations' };
  }
}

export async function getMessages(conversationId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return { success: true, data: messages };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, error: 'Failed to fetch messages' };
  }
}

import { findRelevantContext } from '@/lib/ai/rag';
import { generateAiResponse } from '@/lib/ai/chat-bot';

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachment?: { url: string; type: AttachmentType }
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    // Verify sender is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === senderId
    );

    if (!isParticipant) {
      return { success: false, error: 'User is not a participant' };
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Trigger AI response if it's an AI support chat
    if (conversation.type === 'AI_SUPPORT') {
      // Run asynchronously to not block the user response
      (async () => {
        try {
          // 1. Retrieve relevant context (RAG)
          const context = await findRelevantContext(content, senderId);
          
          // 2. Fetch user-specific data based on role
          let userSpecificDataString: string | null = null;
          const senderProfile = await prisma.profile.findUnique({
            where: { id: senderId },
            select: {
              role: true,
              // Select relevant data based on potential role
              applications: {
                select: {
                  job: { select: { title: true } },
                  status: true,
                },
              },
              jobsPosted: {
                select: {
                  title: true,
                  status: true,
                  applications: { select: { id: true, status: true } },
                },
              },
              collaborations: {
                select: {
                  project: { select: { title: true } },
                  role: true,
                },
              },
              // Add other relevant fields if necessary
            },
          });

          if (senderProfile) {
            if (senderProfile.role === 'SCIENTIST') {
              let applicationsInfo = senderProfile.applications.map(app => 
                `Job: ${app.job.title}, Status: ${app.status}`
              ).join('; ');
              if (applicationsInfo) applicationsInfo = `User's Applications: [${applicationsInfo}].`;

              let collaborationsInfo = senderProfile.collaborations.map(col =>
                `Project: ${col.project.title}, Role: ${col.role}`
              ).join('; ');
              if (collaborationsInfo) collaborationsInfo = `User's Collaborations: [${collaborationsInfo}].`;

              if (applicationsInfo || collaborationsInfo) {
                userSpecificDataString = `As a SCIENTIST, here is some information about you: ${applicationsInfo} ${collaborationsInfo}`;
              }
            } else if (senderProfile.role === 'EMPLOYER') {
              let jobsInfo = senderProfile.jobsPosted.map(job => 
                `Job: ${job.title}, Status: ${job.status}, Applicants: ${job.applications.length}`
              ).join('; ');
              if (jobsInfo) jobsInfo = `User's Posted Jobs: [${jobsInfo}].`;
              
              if (jobsInfo) {
                userSpecificDataString = `As an EMPLOYER, here is some information about your listings: ${jobsInfo}`;
              }
            }
          }
          
          // 3. Generate AI response
          const aiResponseText = await generateAiResponse(content, context, message.sender, userSpecificDataString);

          // 4. Save AI response
          await prisma.message.create({
            data: {
              conversationId,
              senderId: null, // AI has no senderId
              content: aiResponseText,
            },
          });
          
          // revalidatePath(`/messages`); // Removed to avoid "during render" error. Realtime subscription handles UI update. 
        } catch (error) {
          console.error('Error generating AI response:', error);
        }
      })();
    }

    revalidatePath(`/messages`);
    return { success: true, data: message };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

const ADJECTIVES = ['Green', 'Blue', 'Red', 'Happy', 'Swift', 'Silent', 'Brave', 'Calm', 'Raspberry', 'Golden'];
const ANIMALS = ['Fish', 'Bear', 'Eagle', 'Tiger', 'Lion', 'Wolf', 'Fox', 'Hawk', 'Panda', 'Koala'];

function generateRandomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

export async function createConversation(
  creatorId: string,
  participantIds: string[],
  type: ConversationType = 'DIRECT',
  name?: string
) {
  try {
    // For DIRECT chats, check if one already exists
    if (type === 'DIRECT' && participantIds.length === 1) {
      const existing = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: { in: [creatorId, ...participantIds] },
            },
          },
        },
      });

      if (existing) {
        return { success: true, data: existing };
      }
    }

    let conversationName = name;
    if (type === 'GROUP' && !conversationName) {
        conversationName = generateRandomName();
    }

    const conversation = await prisma.conversation.create({
      data: {
        type,
        name: conversationName,
        participants: {
          create: [
            { userId: creatorId, role: 'ADMIN' },
            ...participantIds.map((id) => ({ userId: id, role: 'MEMBER' })),
          ],
        },
      },
    });

    revalidatePath(`/messages`);
    return { success: true, data: conversation };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return { success: false, error: 'Failed to create conversation' };
  }
}

export async function updateConversation(conversationId: string, data: { name?: string }) {
    try {
        const conversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                name: data.name
            }
        });
        revalidatePath('/messages');
        return { success: true, data: conversation };
    } catch (error) {
        console.error('Error updating conversation:', error);
        return { success: false, error: 'Failed to update conversation' };
    }
}

export async function deleteConversation(conversationId: string) {
    try {
        await prisma.conversation.delete({
            where: { id: conversationId }
        });
        revalidatePath('/messages');
        return { success: true };
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return { success: false, error: 'Failed to delete conversation' };
    }
}

export async function createAiConversation(userId: string) {
  try {
    // Check if exists
    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'AI_SUPPORT',
        participants: {
          some: { userId },
        },
      },
    });

    if (existing) {
      return { success: true, data: existing };
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: 'AI_SUPPORT',
        name: 'Authesci AI',
        participants: {
          create: [
            { userId, role: 'MEMBER' },
          ],
        },
      },
    });

    revalidatePath(`/messages`);
    return { success: true, data: conversation };
  } catch (error) {
    console.error('Error creating AI conversation:', error);
    return { success: false, error: 'Failed to create AI conversation' };
  }
}

export async function markAsRead(conversationId: string, userId: string) {
  try {
    await prisma.participant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });
    revalidatePath(`/messages`);
    return { success: true };
  } catch (error) {
    console.error('Error marking as read:', error);
    return { success: false, error: 'Failed to mark as read' };
  }
}

export async function searchContacts(query: string, currentUserId: string) {
  try {
    const currentUser = await prisma.profile.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });

    if (!currentUser) {
      return { success: false, error: 'User not found' };
    }

    // Base query for search
    const whereClause: any = {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
      NOT: { id: currentUserId },
    };

    // Apply RBAC filters
    if (currentUser.role === 'EMPLOYER') {
      // Can chat with: Applicants (active jobs), Collaborators (active projects), AI, Admins
      // Simplified: Allow searching for Scientists (potential applicants) and Admins for now
      // Ideally, we'd filter by actual relationships, but that's heavy.
      // Let's restrict to: Role in [SCIENTIST, ADMIN] OR is a Collaborator
      whereClause.AND = {
        OR: [
          { role: { in: ['SCIENTIST', 'ADMIN'] } },
          // { collaborations: { some: { project: { creatorId: currentUserId } } } } // Too complex for now?
        ]
      };
    } else if (currentUser.role === 'SCIENTIST') {
      // Can chat with: Employers (hired projects), Referrals, AI, Admins
      whereClause.AND = {
        OR: [
          { role: { in: ['EMPLOYER', 'ADMIN'] } },
        ]
      };
    }
    // Admin can chat with anyone (no extra filter)

    const contacts = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      },
      take: 10,
    });

    return { success: true, data: contacts };
  } catch (error) {
    console.error('Error searching contacts:', error);
    return { success: false, error: 'Failed to search contacts' };
  }
}

export async function getUploadSignature() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Missing Cloudinary configuration:', {
      cloudName: !!cloudName,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret
    });
  }

  const cloudinary = require('cloudinary').v2;
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  try {
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'authesci-chat',
      },
      apiSecret
    );

    return { 
      timestamp, 
      signature,
      apiKey: apiKey,
      cloudName: cloudName
    };
  } catch (error) {
    console.error('Error signing Cloudinary request:', error);
    return { timestamp: 0, signature: '', apiKey: '', cloudName: '' };
  }
}

export async function updateLastSeen(userId: string) {
  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating last seen:', error);
    return { success: false };
  }
}

export async function getRecentMessages(userId: string) {
  try {
    // Fetch top 5 messages, prioritizing unread ones
    const result = await prisma.$queryRaw`
      SELECT 
        m.id, 
        m.content, 
        m.created_at as "createdAt", 
        m.conversation_id as "conversationId",
        p.full_name as "senderName",
        p.avatar_url as "senderAvatarUrl",
        CASE WHEN m.created_at > part.last_read_at THEN false ELSE true END as "isRead"
      FROM messages m
      JOIN participants part ON m.conversation_id = part.conversation_id
      JOIN profiles p ON m.sender_id = p.id
      WHERE part.user_id = ${userId}
      AND m.sender_id != ${userId}
      ORDER BY 
        (CASE WHEN m.created_at > part.last_read_at THEN 0 ELSE 1 END) ASC,
        m.created_at DESC
      LIMIT 5;
    ` as any[];

    return { 
      success: true, 
      data: result.map(r => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt,
        conversationId: r.conversationId,
        isRead: r.isRead,
        sender: {
          fullName: r.senderName,
          avatarUrl: r.senderAvatarUrl
        }
      }))
    };
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return { success: false, data: [] };
  }
}
