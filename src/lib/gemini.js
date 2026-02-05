import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key is missing! Check .env.local");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates blog content based on images and prompt
 * @param {string[]} imageParts - Base64 strings of images
 * @param {string} prompt - Text prompt
 * @returns {Promise<string>} Generated text
 */
export async function generateBlogContent(imageParts, prompt) {
  try {
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
