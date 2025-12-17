"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Annotation } from "@/types";
import styles from "./AnnotatedCanvas.module.css";

interface AnnotatedCanvasProps {
  imageData: string | null;
  annotations: Annotation[];
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
  onAnnotationUpdate?: (updatedAnnotations: Annotation[]) => void;
  fontSize?: number;
  fontFamily?: string;
  arrowColor?: string;
}

interface DragState {
  index: number;
  type: "start" | "target";
}

export default function AnnotatedCanvas({
  imageData,
  annotations,
  onCanvasReady,
  onAnnotationUpdate,
  fontSize = 14,
  fontFamily = "sans-serif",
  arrowColor = "rainbow",
}: AnnotatedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoverState, setHoverState] = useState<DragState | null>(null);

  // Helper to get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Use scaling factor if canvas display size differs from actual size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawArrow = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      isHovered: boolean
    ) => {
      const headLength = 12 + (fontSize - 14) * 0.5; // Scale arrow head slightly
      const angle = Math.atan2(toY - fromY, toX - fromX);

      // Draw line
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 4 : 2; // Thicker when hovered
      ctx.stroke();

      // Draw arrowhead
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    },
    [fontSize]
  );

  const drawAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw the image
    ctx.drawImage(image, 0, 0);

    // Draw annotations
    const rainbowColors = [
      "#ef4444", // red
      "#f97316", // orange
      "#eab308", // yellow
      "#22c55e", // green
      "#06b6d4", // cyan
      "#3b82f6", // blue
      "#8b5cf6", // violet
      "#ec4899", // pink
    ];

    annotations.forEach((annotation, index) => {
      const color = arrowColor === "rainbow" 
        ? rainbowColors[index % rainbowColors.length] 
        : arrowColor;
        
      const fromX = (annotation.arrowStartX / 100) * canvas.width;
      const fromY = (annotation.arrowStartY / 100) * canvas.height;
      const toX = (annotation.targetX / 100) * canvas.width;
      const toY = (annotation.targetY / 100) * canvas.height;

      const isTargetHovered = hoverState?.index === index && hoverState?.type === "target";
      const isStartHovered = hoverState?.index === index && hoverState?.type === "start";

      // Draw arrow
      drawArrow(ctx, fromX, fromY, toX, toY, color, isTargetHovered || isStartHovered);

      // Draw target point handle (small circle) if hovered or dragging
      if (isTargetHovered || (dragState?.index === index && dragState?.type === "target")) {
        ctx.beginPath();
        ctx.arc(toX, toY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.stroke();
      }

      // Draw number circle (Start point)
      const circleRadius = fontSize + 4; // Scale circle with font size
      ctx.beginPath();
      ctx.arc(fromX, fromY, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Highlight start point if hovered
      if (isStartHovered) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw number text
      ctx.fillStyle = "white";
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(annotation.number.toString(), fromX, fromY);

      // Draw label box
      const labelPadding = fontSize / 2;
      ctx.font = `${fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(annotation.label);
      const labelWidth = metrics.width + labelPadding * 2;
      const labelHeight = fontSize * 1.5 + 4;
      const labelX = fromX + circleRadius + 4;
      const labelY = fromY - labelHeight / 2;

      // Background
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 4);
      ctx.fill();

      // Label text
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(annotation.label, labelX + labelPadding, labelY + labelHeight / 2);
    });

    onCanvasReady(canvas);
  }, [annotations, drawArrow, onCanvasReady, hoverState, dragState, fontSize, fontFamily, arrowColor]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onAnnotationUpdate) return;
    const { x, y } = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Hit test radius
    const hitRadius = 20;

    // Check points (iterate in reverse to pick top-most)
    for (let i = annotations.length - 1; i >= 0; i--) {
      const ann = annotations[i];
      const startX = (ann.arrowStartX / 100) * canvas.width;
      const startY = (ann.arrowStartY / 100) * canvas.height;
      const targetX = (ann.targetX / 100) * canvas.width;
      const targetY = (ann.targetY / 100) * canvas.height;

      // Check start point
      if (Math.hypot(x - startX, y - startY) <= hitRadius) {
        setDragState({ index: i, type: "start" });
        return;
      }

      // Check target point
      if (Math.hypot(x - targetX, y - targetY) <= hitRadius) {
        setDragState({ index: i, type: "target" });
        return;
      }
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (dragState && onAnnotationUpdate) {
      // Dragging logic
      const w = canvas.width;
      const h = canvas.height;
      
      const newX = Math.max(0, Math.min(100, (x / w) * 100));
      const newY = Math.max(0, Math.min(100, (y / h) * 100));

      const newAnnotations = [...annotations];
      if (dragState.type === "start") {
        newAnnotations[dragState.index] = {
          ...newAnnotations[dragState.index],
          arrowStartX: newX,
          arrowStartY: newY,
        };
      } else {
        newAnnotations[dragState.index] = {
          ...newAnnotations[dragState.index],
          targetX: newX,
          targetY: newY,
        };
      }
      onAnnotationUpdate(newAnnotations);
    } else {
      // Hover logic
      const hitRadius = 20;
      let hovered: DragState | null = null;

      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        const startX = (ann.arrowStartX / 100) * canvas.width;
        const startY = (ann.arrowStartY / 100) * canvas.height;
        const targetX = (ann.targetX / 100) * canvas.width;
        const targetY = (ann.targetY / 100) * canvas.height;

        if (Math.hypot(x - startX, y - startY) <= hitRadius) {
          hovered = { index: i, type: "start" };
          break;
        }
        if (Math.hypot(x - targetX, y - targetY) <= hitRadius) {
          hovered = { index: i, type: "target" };
          break;
        }
      }
      setHoverState(hovered);
      
      // Change cursor
      canvas.style.cursor = hovered ? "pointer" : "default";
    }
  };

  // Handle Mouse Up
  const handleMouseUp = () => {
    setDragState(null);
  };

  const handleMouseLeave = () => {
    setDragState(null);
    setHoverState(null);
  };

  // Setup image onload
  useEffect(() => {
    if (!imageData) {
      onCanvasReady(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      drawAnnotations();
    };
    img.src = `data:image/png;base64,${imageData}`;
  }, [imageData, drawAnnotations, onCanvasReady]);

  // Redraw when annotations change
  useEffect(() => {
    if (imageRef.current && annotations.length > 0) {
      drawAnnotations();
    }
  }, [annotations, drawAnnotations, hoverState, dragState]);

  if (!imageData) {
    return (
      <div className={styles.placeholder}>
        <p>画像をアップロードして指示書を生成してください</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <canvas 
        ref={canvasRef} 
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
