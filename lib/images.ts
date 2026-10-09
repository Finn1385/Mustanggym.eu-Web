import crypto from "node:crypto";
import sharp from "sharp";

export const MAX_EDGE = 2560;

export type ProcessedImage = {
  data: Buffer;
  width: number;
  height: number;
  blurDataUrl: string;
};

/** Normalise any uploaded photo: honour EXIF rotation, strip metadata, cap size, encode WebP. */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const base = sharp(input, { failOn: "error" }).rotate();
  const { data, info } = await base
    .clone()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const blur = await base
    .clone()
    .resize({ width: 16, height: 16, fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  return {
    data,
    width: info.width,
    height: info.height,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

export function randomImageName() {
  return `${crypto.randomBytes(12).toString("hex")}.webp`;
}
