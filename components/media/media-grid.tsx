"use client";

import { MediaFile } from "@/lib/db/schema";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Trash2 } from "lucide-react";

interface MediaGridProps {
  chatId?: string;
  userId?: string;
}

export function MediaGrid({ chatId, userId }: MediaGridProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [chatId, userId]);

  const fetchMedia = async () => {
    try {
      // TODO: Implement API endpoint to fetch media
      setMedia([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete media");
      setMedia(media.filter((m) => m.id !== mediaId));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading media...</div>;

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600 py-8">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (media.length === 0) {
    return <div className="text-center py-8 text-gray-500">No media files found</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {media.map((file) => (
        <div key={file.id} className="rounded-lg border border-gray-200 p-4">
          <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
            {file.fileType === "image" && file.thumbnailUrl ? (
              <img
                src={file.thumbnailUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-gray-400">{file.fileType}</div>
            )}
          </div>
          <h3 className="font-medium text-sm mb-2 truncate">
            {file.metadata?.originalName || file.fileType}
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(file.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
