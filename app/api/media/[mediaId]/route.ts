import { NextRequest, NextResponse } from "next/server";
import { getMediaById, deleteMediaFile } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: { mediaId: string } },
) {
  try {
    const media = await getMediaById(params.mediaId);

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: media.id,
      fileType: media.fileType,
      mimeType: media.mimeType,
      fileSize: media.fileSize,
      fileUrl: media.fileUrl,
      thumbnailUrl: media.thumbnailUrl,
      metadata: media.metadata,
      createdAt: media.createdAt,
    });
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { mediaId: string } },
) {
  try {
    const media = await getMediaById(params.mediaId);

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    await deleteMediaFile(params.mediaId);

    return NextResponse.json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
