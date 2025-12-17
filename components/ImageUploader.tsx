"use client";

import { useCallback, useState } from "react";
import styles from "./ImageUploader.module.css";

interface ImageUploaderProps {
  onImageSelect: (imageData: string, mimeType: string, file: File) => void;
  selectedImage: string | null;
}

export default function ImageUploader({
  onImageSelect,
  selectedImage,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("画像ファイルを選択してください");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Extract base64 data (remove data URL prefix)
        const base64 = result.split(",")[1];
        onImageSelect(base64, file.type, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`${styles.uploader} ${isDragging ? styles.dragging : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {selectedImage ? (
        <div className={styles.preview}>
          <img
            src={`data:image/png;base64,${selectedImage}`}
            alt="Preview"
            className={styles.previewImage}
          />
          <p className={styles.hint}>クリックまたはドロップで画像を変更</p>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p>画像をドラッグ＆ドロップ</p>
          <p className={styles.hint}>またはクリックして選択</p>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className={styles.input}
      />
    </div>
  );
}
