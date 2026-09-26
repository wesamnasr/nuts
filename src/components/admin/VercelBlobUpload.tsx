"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface VercelBlobUploadProps {
  onSuccess: (url: string) => void;
  uploadAction: (formData: FormData) => Promise<{ success: boolean; url?: string; error?: string }>;
  buttonText?: string;
  accept?: string;
}

export function VercelBlobUpload({ 
  onSuccess, 
  uploadAction, 
  buttonText = "Upload Image",
  accept = "image/*"
}: VercelBlobUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadAction(formData);
      if (result.success && result.url) {
        onSuccess(result.url);
        toast.success("Uploaded successfully");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="relative">
      <Input
        type="file"
        accept={accept}
        className="hidden"
        id="vercel-blob-upload"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <label htmlFor="vercel-blob-upload">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full py-6 sm:py-8 rounded-xl sm:rounded-2xl border-primary text-primary hover:bg-primary hover:text-white transition-all font-bold text-base sm:text-lg"
          disabled={isUploading}
          asChild
        >
          <span>
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
            ) : (
              <Upload className="w-5 h-5 mr-3" />
            )}
            {isUploading ? "Uploading..." : buttonText}
          </span>
        </Button>
      </label>
    </div>
  );
}
