"use client";

import { useState, useCallback } from "react";
import type { DragEvent, ClipboardEvent, HTMLAttributes } from "react";

interface useImageUploadOptions {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
}

export function useImageUpload({
  onFilesSelected,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxSizeMB = 10,
  multiple = true,
}: useImageUploadOptions) {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndFilterFiles = useCallback(
    (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter((file) => {
        const isValidType = acceptedTypes.length === 0 || acceptedTypes.includes(file.type);
        const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
        return isValidType && isValidSize;
      });

      if (validFiles.length > 0) {
        if (multiple) {
          onFilesSelected(validFiles);
        } else {
          onFilesSelected([validFiles[0]]);
        }
      }
    },
    [acceptedTypes, maxSizeMB, multiple, onFilesSelected]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndFilterFiles(e.dataTransfer.files);
      }
    },
    [validateAndFilterFiles]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLElement>) => {
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        validateAndFilterFiles(e.clipboardData.files);
      }
    },
    [validateAndFilterFiles]
  );

  return {
    isDragging,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    } as HTMLAttributes<HTMLElement>,
    handlePaste,
    processFiles: validateAndFilterFiles,
  };
}
