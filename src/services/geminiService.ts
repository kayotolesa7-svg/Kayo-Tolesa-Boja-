import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateOromoQuestions(count: number = 10, topic: string = "waliigalaa"): Promise<Question[]> {
  const isGrade11 = topic.includes("K-11");
  const baseTopic = isGrade11 ? topic.split(" ")[0] : topic;
  
  const prompt = `Generate ${count} interesting trivia questions in Afaan Oromo about "${topic}". 
  ${isGrade11 ? `The questions should specifically focus on the Grade 11 curriculum for ${baseTopic} in Ethiopia.` : `If topic is "waliigalaa", cover diverse topics like Oromo culture, history, geography, science, and general knowledge.`}
  Ensure the answers are concise (usually one word or a short phrase, maximum 3 words).
  Provide the output in a structured JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            text: { type: Type.STRING, description: "The quiz question in Afaan Oromo" },
            answer: { type: Type.STRING, description: "The concise correct answer in Afaan Oromo" },
            category: { type: Type.STRING, description: "The category of the question (e.g., Aadaa, Seenaa, Saayinsii)" }
          },
          required: ["id", "text", "answer", "category"]
        }
      }
    }
  });

  try {
    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No response text from Gemini");
    const questions: Question[] = JSON.parse(jsonStr);
    return questions;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw error;
  }
}

export async function sendChatMessage(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are an AI assistant for Kayo Tolesa app. You help Oromo students and users with questions about education (Physics, Biology, Chemistry Grade 11), Oromo culture, history, and general knowledge. Always respond in Afaan Oromo unless asked otherwise. Be helpful, polite, and encouraging.",
      history: history
    }
  });

  const response = await chat.sendMessage(message);
  return response.text;
}
