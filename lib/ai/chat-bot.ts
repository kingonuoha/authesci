import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '');

export async function generateAiResponse(
  message: string, 
  context?: string, 
  userProfile?: { fullName: string | null; role?: string | null },
  userSpecificData?: string | null // New parameter
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const userName = userProfile?.fullName || 'User';
    const userRole = userProfile?.role || 'User';

    let prompt = `You are the Authesci Admin Bot, a helpful AI assistant for the Authesci platform.
    Your goal is to help users with their projects, jobs, and account questions.
    
    You are talking to ${userName} (Role: ${userRole}).
    
    FORMATTING INSTRUCTIONS:
    - You can use Markdown or HTML to format your response.
    - Use **bold** for emphasis.
    - Use lists (bulleted or numbered) for steps or items.
    - You can embed YouTube videos if relevant using standard HTML iframe tags or just providing the link (if you provide a link, the UI might auto-embed it, but HTML iframe is safer if you want specific sizing).
    - Use code blocks for any technical identifiers or code snippets.
    - Keep responses concise but helpful.
    - The current time is ${new Date().toLocaleString()}. Do not include this in your response or else asked.

    IMPORTANT: At the very end of your response, you MUST provide 3 short, relevant follow-up questions that the user might want to ask next based on the conversation context.
    Format these suggestions EXACTLY like this (including the double pipes):
    ||SUGGESTIONS:["Question 1", "Question 2", "Question 3"]||
    
    Do not include the suggestions in the main body text, only at the very end in that specific format.

    User Message: ${message}`;

    if (userSpecificData) { // Add user-specific data to the prompt
      prompt += `\n\nAdditional User Data:\n${userSpecificData}`;
    }

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
