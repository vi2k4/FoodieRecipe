"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkle } from "@phosphor-icons/react";

import UploadBox from "./UploadBox";
import GenerateButton from "./GenerateButton";
import IngredientBadge from "./IngredientBadge";
import ResultCard from "./8. ResultCard";
import { analyzeImage } from "@/lib/ai-api";
import type { Ingredient, SavedRecipe } from "@/types/ai";

export default function AIRecipeCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setIngredients([]);
    setRecipe(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn ảnh nguyên liệu trước");
      return;
    }

    setLoading(true);
    setIngredients([]);
    setRecipe(null);

    try {
      const result = await analyzeImage(selectedFile);
      setIngredients(result.ingredients);
      setRecipe(result.recipe);
      toast.success("Đã tạo công thức từ AI");
    } catch (error) {
      toast.error("Không thể tạo công thức", {
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 w-full max-w-xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold"><Sparkle size={26} weight="duotone" className="text-orange-500" aria-hidden="true" /> Quét tủ lạnh — AI gợi ý món ăn</h1>

      <p className="text-gray-500 mt-2">
        Chụp ảnh nguyên liệu bạn có, hệ thống tự nhận diện và sáng tạo công thức
        hoàn chỉnh.
      </p>

      <UploadBox
        previewUrl={previewUrl}
        disabled={loading}
        onFileSelect={handleFileSelect}
      />

      <GenerateButton
        loading={loading}
        disabled={!selectedFile}
        onClick={handleGenerate}
      />

      {ingredients.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Nguyên liệu nhận diện được</h3>

          <div className="flex flex-wrap gap-3">
            {ingredients.map((item) => (
              <IngredientBadge key={item.name} ingredient={item} />
            ))}
          </div>
        </div>
      )}

      {recipe && <ResultCard recipe={recipe} />}
    </div>
  );
}
