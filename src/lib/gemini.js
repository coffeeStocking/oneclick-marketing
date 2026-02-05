import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateBlogContent(imageParts, prompt) {
  const API_KEY = process.env.GEMINI_API_KEY?.trim();

  if (!API_KEY) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. Cloudflare Settings에서 GEMINI_API_KEY를 확인해주세요.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  // 시도할 모델 리스트 (가장 최신 -> 차선책)
  const modelsToTry = ["gemini-3-flash-preview", "gemini-2.5-flash"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const generatedContent = await model.generateContent([
        prompt,
        ...imageParts.map(part => ({
          inlineData: {
            data: part,
            mimeType: "image/jpeg"
          }
        }))
      ]);

      const response = await generatedContent.response;
      return response.text();
    } catch (error) {
      lastError = error;
      // 503(Overloaded)이나 일시적인 서버 오류인 경우에만 다음 모델로 넘어감
      if (error.message?.includes("503") || error.message?.includes("overloaded") || error.message?.includes("Unavailable")) {
        console.warn(`${modelName} is overloaded, trying next model...`);
        continue;
      }
      // 그 외의 치명적 에러(인증 등)는 즉시 중단
      throw error;
    }
  }

  // 모든 모델이 실패한 경우
  throw lastError;
}
