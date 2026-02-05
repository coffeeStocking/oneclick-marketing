"use client";

import { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import { createCollage } from "../utils/imageProcessor";

export default function Home() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ blog: "", insta: "" });
  const [collage, setCollage] = useState(null);

  const handleImagesSelected = (images) => {
    setSelectedImages(images);
    setCollage(null); // Reset collage when images change
  };

  const handleGenerateCollage = async () => {
    if (selectedImages.length === 0) return;
    try {
      const imageUrls = selectedImages.map(img => img.preview);
      const collageUrl = await createCollage(imageUrls);
      setCollage(collageUrl);
    } catch (e) {
      console.error("Collage failed", e);
      alert("콜라주 생성 실패");
    }
  };

  const handleGenerate = async () => {
    if (selectedImages.length === 0) {
      alert("이미지를 먼저 업로드해주세요.");
      return;
    }

    setLoading(true);
    setResult({ blog: "", insta: "" });

    // Auto-generate collage if not present
    if (!collage) {
      // We don't await this to start API call in parallel, 
      // but state update might conflict? Better to await or just let user click.
      // Let's await to be safe or just call it.
      handleGenerateCollage();
    }

    try {
      // Extract base64 strings (remove data URL prefix)
      const imageParts = selectedImages.map(img =>
        img.preview.split(",")[1]
      );

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: imageParts }),
      });

      const data = await response.json();

      if (response.ok) {
        // Parse results using delimiters
        const text = data.text;
        const blogMatch = text.match(/\[BLOG_CONTENT\]([\s\S]*?)(?=\[INSTA_CONTENT\]|$)/);
        const instaMatch = text.match(/\[INSTA_CONTENT\]([\s\S]*)/);

        setResult({
          blog: blogMatch ? blogMatch[1].trim() : text,
          insta: instaMatch ? instaMatch[1].trim() : ""
        });
      } else {
        const errorMessage = data.details ? `${data.error}\n(상세: ${data.details})` : data.error || "Unknown error";
        alert("생성 중 오류가 발생했습니다: " + errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("요청 실패: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("복사되었습니다!");
  };

  return (
    <main className="container" style={{ padding: "4rem 1rem" }}>
      <header style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{
          fontSize: "3rem",
          fontWeight: "800",
          marginBottom: "1rem",
          background: "var(--gradient-primary)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          OneClick Marketing
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>
          사진만 올리면 블로그 글과 인스타그램 콘텐츠가 자동으로 완성됩니다.
        </p>
      </header>

      <section className="card">
        <ImageUploader onImagesSelected={handleImagesSelected} />

        <div style={{ marginTop: "2rem", textAlign: "center", display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            className="btn btn-secondary"
            style={{
              fontSize: "1.0rem",
              padding: "0.8rem 1.5rem",
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)"
            }}
            onClick={handleGenerateCollage}
            disabled={selectedImages.length === 0}
          >
            📸 콜라주 미리보기
          </button>
          <button
            className="btn btn-primary"
            style={{
              fontSize: "1.1rem",
              padding: "0.8rem 2rem",
              opacity: selectedImages.length > 0 && !loading ? 1 : 0.5,
              cursor: selectedImages.length > 0 && !loading ? "pointer" : "not-allowed"
            }}
            onClick={handleGenerate}
            disabled={selectedImages.length === 0 || loading}
          >
            {loading ? "AI가 글을 쓰고 있어요..." : "콘텐츠 생성하기 ✨"}
          </button>
        </div>
      </section>

      {collage && (
        <section className="card" style={{ marginTop: "2rem", textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem", color: "var(--primary)" }}>인스타그램 콜라주</h2>
          <img src={collage} alt="Collage" style={{ maxWidth: "100%", borderRadius: "var(--radius)", maxHeight: "500px" }} />
          <div style={{ marginTop: "1rem" }}>
            <a href={collage} download="collage.jpg" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
              이미지 다운로드
            </a>
          </div>
        </section>
      )}

      {result.blog && (
        <section className="card" style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", color: "var(--primary)" }}>📝 블로그 포스팅</h2>
          <div style={{ lineHeight: "1.8", color: "var(--foreground)", whiteSpace: "pre-wrap" }}>
            {result.blog}
          </div>
        </section>
      )}

      {result.insta && (
        <section className="card" style={{ marginTop: "2rem", border: "1px solid #e1306c" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ color: "#e1306c", margin: 0 }}>💖 인스타그램 캡션</h2>
            <button
              className="btn"
              style={{ background: "#e1306c", color: "white", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
              onClick={() => copyToClipboard(result.insta)}
            >
              문구 복사하기 📋
            </button>
          </div>
          <div style={{ lineHeight: "1.6", color: "var(--foreground)", whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
            {result.insta}
          </div>
        </section>
      )}
    </main>
  );
}
