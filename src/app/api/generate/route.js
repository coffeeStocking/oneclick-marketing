import { generateBlogContent } from "@/lib/gemini";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request) {
    try {
        const body = await request.json();
        const { images } = body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json(
                { error: "Images are required" },
                { status: 400 }
            );
        }

        // Default prompt for blog generation
        const prompt = `
당신은 전문 맛집/여행 블로거입니다. 
주어진 사진들을 보고 생동감 넘치고 매력적인 블로그 포스팅을 작성해주세요.
다음 포맷을 따라주세요:

## 제목: [매력적인 제목]

### 1. 도입부
- 방문 계기나 첫인상

### 2. 분위기와 특징
- 사진에서 보이는 인테리어, 분위기 묘사

### 3. 주요 메뉴/경험
- 음식 사진이 있다면 맛과 비주얼 상세 묘사
- 여행지라면 풍경 묘사

### 4. 총평 및 추천
- 장점, 추천 대상

(이모지를 적절히 사용하여 글을 생동감 있게 만들어주세요.)
    `;

        const generatedText = await generateBlogContent(images, prompt);

        return NextResponse.json({ text: generatedText });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
