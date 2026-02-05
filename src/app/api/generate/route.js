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
        당신은 전문 마케팅 전문가입니다. 
        주어진 사진들을 분석하여 다음 **두 가지 버전**의 채널별 콘텐츠를 작성해주세요.
        출력 시 반드시 [BLOG_CONTENT]와 [INSTA_CONTENT]라는 구분자를 사용해주세요.

        [BLOG_CONTENT]
        ## 제목: [매력적인 제목]
        맛깔나는 도입부와 사진별 상세 설명, 그리고 총평을 포함한 정보성 블로그 글을 이모지를 섞어서 풍성하게 작성해주세요.

        [INSTA_CONTENT]
        인스타그램 감성에 맞는 감각적인 캡션과 관련 해시태그 20개를 포함해주세요. 
        (짧고 강렬한 첫 문장, 이모지 활용 필수)
        `;

        const generatedText = await generateBlogContent(images, prompt);

        return NextResponse.json({ text: generatedText });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                error: "블로그 생성 중 오류가 발생했습니다.",
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
