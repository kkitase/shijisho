// Types for the Shijisho Generator App

export interface Annotation {
  number: number;
  label: string;
  targetX: number;
  targetY: number;
  arrowStartX: number;
  arrowStartY: number;
}

export interface AnalyzeRequest {
  image: string; // base64 encoded image
  instructions: string[];
}

export interface AnalyzeResponse {
  annotations: Annotation[];
  error?: string;
}
