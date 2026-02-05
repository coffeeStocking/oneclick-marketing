"use client";

import { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import { createCollage } from "../utils/imageProcessor";

export default function Home() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
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
    setResult("");

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
        setResult(data.text);
      } else {
        alert("생성 중 오류가 발생했습니다: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("요청 실패: " + error.message);
    } finally {
      setLoading(false);
    }
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

      {result && (
        <section className="card" style={{ marginTop: "2rem", whiteSpace: "pre-wrap" }}>
          <h2 style={{ marginBottom: "1rem", color: "var(--primary)" }}>생성된 블로그 글</h2>
          <div style={{ lineHeight: "1.8", color: "var(--foreground)" }}>
            {result}
          </div>
        </section>
      )}
    </main>
  );
}
