"use client";

import { useState, useCallback } from "react";
import ImageUploader from "@/components/ImageUploader";
import InstructionForm from "@/components/InstructionForm";
import AnnotatedCanvas from "@/components/AnnotatedCanvas";
import DownloadButton from "@/components/DownloadButton";
import { Annotation, AnalyzeResponse } from "@/types";

export default function Home() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [instructions, setInstructions] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [arrowColor, setArrowColor] = useState("rainbow");

  const handleImageSelect = useCallback(
    (data: string, type: string) => {
      setImageData(data);
      setMimeType(type);
      setAnnotations([]);
      setError(null);
    },
    []
  );

  const parseInstructions = (text: string): string[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Remove leading numbers like "1." or "1:" or "1)"
        return line.replace(/^\d+[\.\:\)]\s*/, "");
      });
  };

  const handleGenerate = async () => {
    if (!imageData || !instructions.trim()) {
      setError("画像と修正指示を入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsedInstructions = parseInstructions(instructions);
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
          mimeType: mimeType,
          instructions: parsedInstructions,
        }),
      });

      const data: AnalyzeResponse = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setAnnotations(data.annotations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCanvasReady = useCallback((c: HTMLCanvasElement | null) => {
    setCanvas(c);
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title font-serif">
          想いをはかる、指示書。
        </h1>
        <p className="subtitle">
          言葉では零れ落ちてしまう繊細なニュアンスを、AIがそっと視覚化します。<br />
          あなたの「こうしたい」という純粋な想いを、誠実に届けるために。
        </p>
      </header>
      
      <main className="main">
        {/* Left Panel - Input */}
        <div className="panel">
          <div className="section">
            <h2 className="panelTitle">
              <span className="font-serif" style={{ fontSize: "3.5rem", color: "var(--color-accent)", marginRight: "1.5rem", opacity: 0.6, lineHeight: 1 }}>01</span>
              対象を見つめる
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--color-text-light)", marginBottom: "2rem" }}>
              修正を加えたいデザインや画像を、こちらへ置いてください。
            </p>
            <ImageUploader
              onImageSelect={handleImageSelect}
              selectedImage={imageData}
            />
          </div>

          <div className="section" style={{ marginTop: "6rem" }}>
            <h2 className="panelTitle">
              <span className="font-serif" style={{ fontSize: "3.5rem", color: "var(--color-accent)", marginRight: "1.5rem", opacity: 0.6, lineHeight: 1 }}>02</span>
              想いを綴る
            </h2>
             <p style={{ fontSize: "1rem", color: "var(--color-text-light)", marginBottom: "2rem" }}>
              どこを、どのように整えたいか。あなたの言葉で記してください。
            </p>
            <InstructionForm
              value={instructions}
              onChange={setInstructions}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              disabled={!imageData}
            />
          </div>

          {error && <div className="error">{error}</div>}

          {annotations.length > 0 && (
            <div className="section" style={{ marginTop: "4rem" }}>
              <h3 className="panelTitle" style={{ fontSize: "1.5rem", borderBottom: "none" }}>紡ぎ出された想い</h3>
              <ul className="annotationList">
                {annotations.map((annotation) => (
                  <li key={annotation.number} className="annotationItem">
                    <span className="annotationNumber">{annotation.number}</span>
                    <span className="annotationLabel">{annotation.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="panel">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem" }}>
            <h2 className="panelTitle" style={{ marginBottom: 0 }}>
               視覚化された指示
            </h2>
            
            {annotations.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    文字サイズ
                    <input 
                      type="range" 
                      min="10" 
                      max="32" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      style={{ accentColor: "var(--color-accent)", cursor: "pointer", width: "100px" }}
                    />
                    {fontSize}px
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    フォント
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
                    >
                      <option value="sans-serif">ゴシック (標準)</option>
                      <option value="serif">明朝</option>
                      <option value="'Yu Gothic', sans-serif">游ゴシック</option>
                      <option value="'Hiragino Kaku Gothic ProN', sans-serif">ヒラギノ角ゴ</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    矢印の色
                    <select
                      value={arrowColor}
                      onChange={(e) => setArrowColor(e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
                    >
                      <option value="rainbow">🌈 自動 (虹色)</option>
                      <option value="#ef4444">🔴 赤 (#ef4444)</option>
                      <option value="#f97316">🟠 オレンジ (#f97316)</option>
                      <option value="#eab308">🟡 黄 (#eab308)</option>
                      <option value="#22c55e">🟢 緑 (#22c55e)</option>
                      <option value="#06b6d4">🔵 シアン (#06b6d4)</option>
                      <option value="#3b82f6">🔵 青 (#3b82f6)</option>
                      <option value="#8b5cf6">🟣 紫 (#8b5cf6)</option>
                      <option value="#ec4899">🌸 ピンク (#ec4899)</option>
                      <option value="#333333">⚫️ 黒 (#333333)</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <AnnotatedCanvas
            imageData={imageData}
            annotations={annotations}
            onCanvasReady={handleCanvasReady}
            onAnnotationUpdate={setAnnotations}
            fontSize={fontSize}
            fontFamily={fontFamily}
            arrowColor={arrowColor}
          />
          
          {annotations.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <DownloadButton
                canvas={canvas}
                disabled={!canvas || annotations.length === 0}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
