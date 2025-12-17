"use client";

import styles from "./DownloadButton.module.css";

interface DownloadButtonProps {
  canvas: HTMLCanvasElement | null;
  disabled: boolean;
}

export default function DownloadButton({
  canvas,
  disabled,
}: DownloadButtonProps) {
  const handleDownload = () => {
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `指示書_${new Date().toISOString().split("T")[0]}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <button
      className={styles.button}
      onClick={handleDownload}
      disabled={disabled}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      画像をダウンロード
    </button>
  );
}
