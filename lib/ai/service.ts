import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS } from "./prompts";
import mammoth from "mammoth";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { createNotification } from "@/lib/notifications/service";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will fail.");
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy_key");

// Define model hierarchy for failover
const FALLBACK_MODELS = [
  "gemini-2.5-flash", 
  "gemini-2.0-flash", 
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite"
];

// Helper to notify admin about model overload
async function notifyAdminOfOverload(modelName: string, error: any) {
  try {
    const admins = await prisma.profile.findMany({
      where: { role: Role.ADMIN },
      select: { id: true }
    });
    
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "SYSTEM_ALERT",
        `AI Model ${modelName} overloaded. Switching to backup. Error: ${error.message || 'Unknown'}`,
        "AI Model Overload",
        "/admin/logs"
      );
    }
  } catch (e) {
    console.error("Failed to notify admin of AI overload", e);
  }
}

// Helper to generate content with retry and failover
async function generateContentWithRetry(prompt: string, attempt = 0): Promise<string> {
  const modelName = FALLBACK_MODELS[attempt];
  if (!modelName) {
    throw new Error("All AI models are currently overloaded. Please try again later.");
  }

  const currentModel = genAI.getGenerativeModel({ model: modelName });

  try {
    const result = await currentModel.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    // Check for overload (503) or Rate Limit (429)
    if (error.status === 503 || error.status === 429 || (error.message && (error.message.includes("overloaded") || error.message.includes("quota") || error.message.includes("429")))) {
      console.warn(`Model ${modelName} failed (Status: ${error.status}). Switching to backup...`);
      
      // Notify Admin
      await notifyAdminOfOverload(modelName, error);

      // Recursive retry with next model
      return generateContentWithRetry(prompt, attempt + 1);
    }
    
    // If it's another error, throw it
    throw error;
  }
}

const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export const isAIEnabled = () => process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES;
export const isAiFreeAccess = () => process.env.NEXT_PUBLIC_AI_FREE_ACCESS;

export async function generateEmbeddings(text: string) {
  if (!isAIEnabled()) return null;
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return null;
  }
}

export async function generateCoverLetter(profile: any, job: any) {
  if (!isAIEnabled()) throw new Error("AI features are disabled");
  
  const jsonInfo = (data: any) => JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
  );

  const prompt = SYSTEM_PROMPTS.GENERATE_COVER_LETTER
    .replace("{profile}", jsonInfo(profile))
    .replace("{job}", jsonInfo(job));

  return await generateContentWithRetry(prompt);
}

export async function rankApplicants(candidates: any[], jobDescription: string) {
  if (!isAIEnabled()) return candidates;

  // Limit candidates data to avoid token limits
  const simplifiedCandidates = candidates.map(c => ({
    id: c.id,
    skills: c.skills,
    experience: c.experience,
    bio: c.bio
  }));

  const prompt = SYSTEM_PROMPTS.RANK_APPLICANTS
    .replace("{jobDescription}", jobDescription)
    .replace("{candidates}", JSON.stringify(simplifiedCandidates));

  try {
    const text = await generateContentWithRetry(prompt);
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return candidates;
  } catch (error) {
    console.error("Error ranking applicants:", error);
    return candidates;
  }
}

export async function extractCvText(cvUrl: string): Promise<string> {
  if (!cvUrl) return "";

  try {
    const response = await fetch(cvUrl);
    if (!response.ok) throw new Error(`Failed to fetch CV: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/pdf") || cvUrl.endsWith(".pdf")) {
      // Polyfill DOMMatrix for pdf-parse in Node
      if (typeof DOMMatrix === 'undefined') {
          (global as any).DOMMatrix = class DOMMatrix {};
      }
      const pdf = require("pdf-parse");
      const data = await pdf(buffer);
      return data.text;
    } else if (contentType?.includes("wordprocessingml") || cvUrl.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } else {
        // Fallback: try to read as text if it's not binary
        return buffer.toString('utf-8');
    }
  } catch (error) {
    console.error("Error extracting CV text:", error);
    return "";
  }
}

export async function calculateMatchScore(profile: any, jobDescription: string) {
  if (!isAIEnabled()) return null;

  const simplifiedProfile = {
    skills: profile.skills,
    experience: profile.experience,
    bio: profile.bio,
    // Add other relevant fields
  };

  const prompt = SYSTEM_PROMPTS.JOB_MATCH_REASONING
    .replace("{profile}", JSON.stringify(simplifiedProfile))
    .replace("{jobDescription}", jobDescription);

  try {
    const text = await generateContentWithRetry(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Error calculating match score:", error);
    return null;
  }
}



export async function rankJobs(profile: any, jobs: any[]) {
  if (!isAIEnabled()) return jobs;

  try {
    // Generate embedding for profile
    const textToEmbed = `${profile.skills.join(" ")} ${profile.bio || ""} ${profile.experience || ""}`;
    const embedding = await generateEmbeddings(textToEmbed);

    if (!embedding) return jobs;

    const jobIds = jobs.map(j => j.id);
    if (jobIds.length === 0) return jobs;

    // Cast embedding to string for SQL
    const vectorString = `[${embedding.join(",")}]`;
    
    // Query for similarity scores
    const vectorResults = await prisma.$queryRaw`
      SELECT id, 1 - ("aiFeatureVector" <=> ${vectorString}::vector) as similarity
      FROM jobs
      WHERE id IN (${Prisma.join(jobIds)})
      AND "aiFeatureVector" IS NOT NULL
    ` as { id: string, similarity: number }[];

    const scoreMap = new Map(vectorResults.map(r => [r.id, r.similarity]));

    // Sort jobs by similarity
    const rankedJobs = jobs.map(job => {
        const similarity = scoreMap.get(job.id) || 0;
        return {
          ...job,
          matchScore: Math.round(similarity * 100),
          // Optional: Add basic reasoning based on score
          aiReasoning: similarity > 0.7 ? { reasoning: "High match based on skills and experience overlap." } : null
        };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return rankedJobs;

  } catch (error) {
    console.error("Error ranking jobs with vector search:", error);
    // Fallback to original LLM method if vector search fails (e.g. extension missing)
    // or just return unranked
    return jobs;
  }
}
