"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";

interface MediaUploaderProps {
  chatId: string;
  userId: string;
  onUploadComplete?: (mediaId: string) => void;
}

export function MediaUploader({ chatId, userId, onUploadComplete }: MediaUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", chatId);
      formData.append("userId", userId);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Upload failed");
        return;
      }

      const data = await response.json();
      setProgress(100);
      onUploadComplete?.(data.media.id);
    } catch (err) {
      setError("An error occurred during upload");
      console.error(err);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          asChild
        >
          <div className="flex items-center justify-center space-x-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>{isLoading ? "Uploading..." : "Upload Media"}</span>
          </div>
        </Button>
      </label>

      {progress > 0 && progress < 100 && (
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
