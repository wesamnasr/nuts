"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { uploadPortfolioMedia } from "@/actions/portfolio";
import { useLocale } from "@/i18n/LocaleContext";
import { MediaType } from "@prisma/client";

interface PortfolioMediaUploadProps {
  initialUrl?: string;
  initialType?: MediaType;
  onChange: (url: string, type: MediaType, publicId?: string, thumbnailUrl?: string) => void;
  folder?: string;
  label?: string;
  onRemove?: () => void;
}

export function PortfolioMediaUpload({ 
  initialUrl, 
  initialType, 
  onChange, 
  folder = "portfolio",
  label,
  onRemove 
}: PortfolioMediaUploadProps) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [mediaType, setMediaType] = useState<MediaType | null>(initialType || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDragging, dragHandlers, handlePaste, processFiles } = useImageUpload({
    onFilesSelected: async (selectedFiles) => {
      const file = selectedFiles[0];
      if (!file) return;

      if (file.size > 20 * 1024 * 1024) {
        alert(isAr ? "حجم الملف كبير جداً (الحد الأقصى ٢٠ ميجابايت)" : "File too large (Max 20MB)");
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      try {
        const result = await uploadPortfolioMedia(formData);
        if (result.success && result.data) {
          const type = result.data.resourceType === "video" ? MediaType.VIDEO : MediaType.IMAGE;
          setPreview(result.data.url);
          setMediaType(type);
          onChange(result.data.url, type, result.data.publicId, result.data.thumbnailUrl);
        } else {
          alert(result.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("An unexpected error occurred");
      } finally {
        setIsUploading(false);
      }
    },
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime"],
    multiple: false
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const clearMedia = () => {
    setPreview(null);
    setMediaType(null);
    onChange("", MediaType.IMAGE); // Reset
    if (onRemove) onRemove();
  };

  return (
    <div className="space-y-4">
      <div 
        className={`
            relative aspect-square sm:aspect-4/5 rounded-2xl overflow-hidden bg-neutral-100 group shadow-inner
            flex flex-col items-center justify-center gap-4 transition-all duration-300
            ${preview ? 'border-neutral-200 bg-black/5' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 cursor-pointer'}
            ${isDragging ? 'ring-4 ring-primary ring-offset-2 scale-[0.98] border-primary border-dashed bg-primary/5' : ''}
        `}
        onClick={() => !preview && fileInputRef.current?.click()}
        {...dragHandlers}
        onPaste={handlePaste}
        tabIndex={0}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            <span className="text-xs sm:text-sm font-medium text-neutral-500">{t("uploading")}...</span>
          </div>
        ) : preview ? (
          <>
            {mediaType === MediaType.VIDEO ? (
              <video 
                src={preview} 
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl" 
                controls 
                muted
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl" 
              />
            )}
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearMedia();
              }}
              className="absolute -top-2 -right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black/50 text-white text-[10px] sm:text-xs rounded-md backdrop-blur-sm">
                {mediaType === MediaType.VIDEO ? "VIDEO" : "IMAGE"}
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-neutral-700">
                {label || (isAr ? "اضغط لرفع صورة أو فيديو" : "Click to upload image or video")}
            </p>
            <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">MP4, JPG, PNG (Max 20MB)</p>
          </div>
        )}
      </div>

        <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
        />
    </div>
  );
}
