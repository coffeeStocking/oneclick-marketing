import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateBlogContent(imageParts, prompt) {
  const API_KEY = process.env.GEMINI_API_KEY?.trim();

  if (!API_KEY) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. Cloudflare Settings에서 GEMINI_API_KEY를 확인해주세요.");
  }

  try {
    // 최신 Gemini 2.5 Flash 모델을 사용하여 더 품질 높은 마케팅 콘텐츠를 생성합니다.
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
