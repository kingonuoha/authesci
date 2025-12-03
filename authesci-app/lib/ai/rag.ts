import { prisma } from '@/lib/prisma';
import { generateEmbedding } from './embedding';

interface ContextItem {
  id: string;
  content: string | null;
  summary: string | null;
  similarity: number;
  type: 'FILE' | 'JOB' | 'PROFILE';
  title?: string; // For file name or job title
}

export async function findRelevantContext(query: string, userId: string): Promise<string> {
  try {
    const embedding = await generateEmbedding(query);
    
    // Format embedding for pgvector (string representation of array)
    const vectorString = `[${embedding.join(',')}]`;

    // 1. Search Project Files (User must be a collaborator or creator)
    // We need to filter by projects the user has access to.
    // This complex join might be heavy for raw SQL, so we might simplify or do two steps.
    // For MVP/Batch 10, let's assume we search all files the user *could* access.
    // Actually, let's just search all files for now to prove RAG works, 
    // but ideally we filter by `project.collaborators` or `project.creatorId`.
    
    // Safe raw query with RLS-like logic is hard in raw SQL without duplicating logic.
    // Let's search public context or context relevant to the user's projects.
    
    const files = await prisma.$queryRaw`
      SELECT 
        pf.id, 
        pf.content, 
        pf.summary, 
        pf.file_name as title,
        1 - (pf."aiFeatureVector" <=> ${vectorString}::vector) as similarity
      FROM project_files pf
      JOIN projects p ON pf.project_id = p.id
      WHERE 
        pf."aiFeatureVector" IS NOT NULL
        AND (
          p.creator_id = ${userId}
          OR EXISTS (
            SELECT 1 FROM collaborators c 
            WHERE c.project_id = p.id AND c.user_id = ${userId} AND c.status = 'ACTIVE'
          )
        )
      ORDER BY pf."aiFeatureVector" <=> ${vectorString}::vector ASC
      LIMIT 3;
    ` as any[];

    // 2. Search Jobs (Publicly available or user's jobs)
    // For now, let's just stick to files as that's the primary RAG requirement for "project files".

    const contextItems: ContextItem[] = files.map((f) => ({
      id: f.id,
      content: f.content,
      summary: f.summary,
      similarity: f.similarity,
      type: 'FILE',
      title: f.title
    }));

    if (contextItems.length === 0) {
      return '';
    }

    // Format context for the LLM
    const formattedContext = contextItems.map((item) => {
      return `[${item.type}: ${item.title}]\n${item.summary || item.content || 'No content available.'}`;
    }).join('\n\n');

    return `Relevant Context:\n${formattedContext}\n\n`;

  } catch (error) {
    console.error('Error finding relevant context:', error);
    return ''; // Fail gracefully, return no context
  }
}
