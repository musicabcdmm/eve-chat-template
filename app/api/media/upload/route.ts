import { NextRequest, NextResponse } from "next/server";
import { createMediaFile } from "@/lib/db/queries";
import { logActivity } from "@/lib/db/queries";
import { randomUUID } from "node:crypto";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const chatId = formData.get("chatId") as string;
    const userId = formData.get("userId") as string;

    if (!file || !chatId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: file, chatId, userId" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 413 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Allowed types: images and videos" },
        { status: 415 },
      );
    }

    // Determine file type
    let fileType: "image" | "video" | "document" = "document";
    if (file.type.startsWith("image/")) fileType = "image";
    else if (file.type.startsWith("video/")) fileType = "video";

    // TODO: Upload to Vercel Blob or S3
    // For now, create a placeholder URL
    const fileId = randomUUID();
    const fileUrl = `/api/media/${fileId}/${file.name}`;

    const media = await createMediaFile({
      chatId,
      userId,
      fileType,
      mimeType: file.type,
      fileSize: file.size,
      fileUrl,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    await logActivity(
      userId,
      "media.uploaded",
      `${fileType} uploaded`,
      { mediaId: media.id, fileName: file.name, fileSize: file.size },
    );

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        media: {
          id: media.id,
          fileType: media.fileType,
          fileUrl: media.fileUrl,
          fileSize: media.fileSize,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}
