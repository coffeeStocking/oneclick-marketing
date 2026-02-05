"use client";

import { useState, useRef } from "react";
import "./ImageUploader.css";

export default function ImageUploader({ onImagesSelected }) {
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFiles = (files) => {
        const newImages = [];
        const maxFiles = 10 - images.length;

        // Convert FileList to Array and slice to fit max
        const fileArray = Array.from(files).slice(0, maxFiles);

        if (fileArray.length === 0) {
            if (files.length > 0 && images.length >= 10) {
                alert("최대 10장까지만 업로드 가능합니다.");
            }
            return;
        }

        fileArray.forEach(file => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newImages.push({
                        file,
                        preview: e.target.result
                    });

                    if (newImages.length === fileArray.length) {
                        const updatedImages = [...images, ...newImages];
                        setImages(updatedImages);
                        // Pass base64 data (stripping header) to parent
                        // But for now passing raw objects might be better, parent can process?
                        // Let's pass the list of objects for now.
                        onImagesSelected(updatedImages);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        processFiles(e.target.files);
    };

    const removeImage = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        onImagesSelected(updatedImages);
    };

    return (
        <div className="uploader-container">
            <div
                className={`drop-zone ${isDragging ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <p>{images.length < 10 ? "이미지를 드래그하거나 클릭하여 업로드하세요" : "최대 업로드 개수에 도달했습니다"}</p>
                <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                    {images.length} / 10 장
                </div>
            </div>

            {images.length > 0 && (
                <div className="preview-grid">
                    {images.map((img, idx) => (
                        <div key={idx} className="preview-item">
                            <img src={img.preview} alt={`Upload ${idx}`} />
                            <button
                                className="remove-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(idx);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
