import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateBlogContent(imageParts, prompt) {
  const API_KEY = process.env.GEMINI_API_KEY?.trim();

  if (!API_KEY) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. Cloudflare Settings에서 GEMINI_API_KEY를 확인해주세요.");
  }

  try {
    // 최신 안정 버전인 v1을 사용하며, 무료 티어에서도 잘 작동하는 1.5 Flash 모델을 지정합니다.
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
