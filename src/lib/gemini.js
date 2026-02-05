import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateBlogContent(imageParts, prompt) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. Cloudflare Settings에서 GEMINI_API_KEY를 확인해주세요.");
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // using gemini-1.5-flash for speed and multimodal capabilities
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
