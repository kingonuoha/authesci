import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '');

export async function generateAiResponse(message: string, context?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    let prompt = `You are the Authesci Admin Bot, a helpful AI assistant for the Authesci platform.
    Your goal is to help users with their projects, jobs, and account questions.
    
    User Message: ${message}`;

    if (context) {
      prompt += `\n\nContext:\n${context}`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('AI Generation Error:', error);
    return "I'm sorry, I'm having trouble processing your request right now.";
  }
}
