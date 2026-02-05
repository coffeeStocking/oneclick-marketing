import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateBlogContent(imageParts, prompt) {
  const API_KEY = process.env.GEMINI_API_KEY?.trim();

  if (!API_KEY) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. Cloudflare Settings에서 GEMINI_API_KEY를 확인해주세요.");
  }

  try {
    // 가장 최신 모델인 Gemini 3 Flash Preview를 사용하여 압도적인 퀄리티의 콘텐츠를 생성합니다.
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const generatedContent = await model.generateContent([
      prompt,
      ...imageParts.map(part => ({
        inlineData: {
          data: part,
          mimeType: "image/jpeg" // Adjust based on actual type if needed, but jpeg usually works for processed images
        }
      }))
    ]);

    const response = await generatedContent.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
