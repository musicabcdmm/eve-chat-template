import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { createReadStream, createWriteStream } from "fs";
import { unlink } from "fs/promises";
import path from "path";

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
}

/**
 * Extract image metadata and validate
 */
export async function getImageMetadata(filePath: string): Promise<ImageMetadata> {
  const image = sharp(filePath);
  const metadata = await image.metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || "unknown",
    size: metadata.size || 0,
  };
}

/**
 * Compress image and generate thumbnail
 */
export async function processImage(
  inputPath: string,
  outputPath: string,
  thumbnailPath: string,
  options?: { quality?: number; width?: number; height?: number },
): Promise<{ image: ImageMetadata; thumbnail: ImageMetadata }> {
  const { quality = 80, width = 1920, height = 1080 } = options || {};

  const image = sharp(inputPath);

  // Compress main image
  await image
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toFile(outputPath);

  // Generate thumbnail
  await sharp(inputPath)
    .resize(200, 200, { fit: "cover" })
    .jpeg({ quality: 60 })
    .toFile(thumbnailPath);

  const imageMetadata = await getImageMetadata(outputPath);
  const thumbnailMetadata = await getImageMetadata(thumbnailPath);

  return { image: imageMetadata, thumbnail: thumbnailMetadata };
}

/**
 * Extract video metadata
 */
export async function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);

      const video = metadata.streams.find((s) => s.codec_type === "video");
      if (!video) reject(new Error("No video stream found"));

      resolve({
        duration: metadata.format.duration || 0,
        width: video?.width || 0,
        height: video?.height || 0,
        fps: eval(video?.r_frame_rate || "0"),
        codec: video?.codec_name || "unknown",
      });
    });
  });
}

/**
 * Generate video thumbnail at specific time
 */
export async function generateVideoThumbnail(
  inputPath: string,
  outputPath: string,
  timeInSeconds = 0,
): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
      })
      .on("end", async () => {
        try {
          const metadata = await getImageMetadata(outputPath);
          resolve(metadata);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
}

/**
 * Compress and re-encode video
 */
export async function processVideo(
  inputPath: string,
  outputPath: string,
  options?: { bitrate?: string; codec?: string },
): Promise<VideoMetadata> {
  const { bitrate = "5000k", codec = "libx264" } = options || {};

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec(codec)
      .videoBitrate(bitrate)
      .audioCodec("aac")
      .audioBitrate("128k")
      .on("end", async () => {
        try {
          const metadata = await getVideoMetadata(outputPath);
          resolve(metadata);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject)
      .save(outputPath);
  });
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete temporary file: ${filePath}`, error);
  }
}
