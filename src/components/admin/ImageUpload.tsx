"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadProductImages } from "@/actions/product";

interface ImageUploadProps {
  productId: string;
  onSuccess?: () => void;
}

export function ImageUpload({ productId, onSuccess }: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setFiles((prev) => [...prev, ...selectedFiles]);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const result = await uploadProductImages(productId, formData);
      if (result.success) {
        toast.success("Images uploaded successfully");
        setFiles([]);
        setPreviews([]);
        onSuccess?.();
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label
          htmlFor="file-upload"
          className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 hover:bg-neutral-50"
        >
          <Upload className="h-8 w-8 text-neutral-400" />
          <span className="mt-1 text-xs text-neutral-500">Add Images</span>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {previews.map((preview, index) => (
          <div key={index} className="relative h-24 w-24 overflow-hidden rounded-lg border">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-50 border border-neutral-200">
              <Image 
                src={preview} 
                alt="Preview" 
                fill
                className="object-cover"
              />
            </div>  
            <button
              onClick={() => removeFile(index)}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white shadow-sm hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {files.length > 0 && (
        <Button onClick={handleUpload} disabled={isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            `Upload ${files.length} Image${files.length > 1 ? "s" : ""}`
          )}
        </Button>
      )}
    </div>
  );
}
