# GitHub 및 Cloudflare Pages 배포 가이드

> **⚠️ 긴급 확인 필요**: 현재 시스템에서 **Git**이 감지되지 않았습니다. 아래 1번 항목을 따라 Git을 먼저 설치해주세요.

현재 시스템에 `git`이 설치되어 있지 않아 자동 배포 설정을 완료할 수 없습니다. 아래 단계를 따라 수동으로 배포를 진행해 주세요.

## 1. Git 설치 (필수)
1. [Git 공식 홈페이지](https://git-scm.com/downloads)에서 Windows용 Git을 다운로드하여 설치합니다.
2. 설치 완료 후 **터미널을 재시작**합니다.

## 2. GitHub 저장소 생성 및 코드 업로드
1. [GitHub](https://github.com/new)에서 새로운 리포지토리를 생성합니다. (이름 예: `oneclick-marketing`)
2. 터미널(VS Code 등)에서 다음 명령어를 순서대로 실행합니다:

```bash
# Git 초기화
git init

# 모든 파일 스테이징
git add .

# 첫 커밋
git commit -m "Initial release of OneClick Marketing"

# 원격 저장소 연결 (Github에서 생성한 주소로 변경)
git remote add origin https://github.com/YOUR_USERNAME/oneclick-marketing.git

# 코드 업로드
git push -u origin main
```

## 3. Cloudflare Pages 배포
1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인하고 **Workers & Pages** 메뉴로 이동합니다.
2. **Create Application** > **Pages** > **Connect to Git**을 선택합니다.
3. 방금 생성한 GitHub 리포지토리(`oneclick-marketing`)를 선택합니다.
4. 배포 설정(Build settings)을 다음과 같이 입력합니다:
   - **Framework preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
5. **Environment variables** (환경 변수) 섹션에 다음을 추가합니다:
   - `GEMINI_API_KEY`: 사용자 `.env.local`에 있는 값
   - `NODE_VERSION`: `18.17.0` 이상 (권장 `20`)
6. **Save and Deploy**를 클릭합니다.

## 4. 완료
배포가 완료되면 제공되는 URL(예: `oneclick-marketing.pages.dev`)로 접속하여 테스트합니다.
