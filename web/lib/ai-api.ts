import { apiClient } from "./api-client";
import type { AnalyzeImageResponse } from "@/types/ai";

export async function analyzeImage(file: File): Promise<AnalyzeImageResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post<AnalyzeImageResponse>(
    "/ai/analyze-image",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
}
