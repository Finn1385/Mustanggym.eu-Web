import type { GalleryPhoto } from "@/components/site/gallery";
import { getGallery, mediaUrl, type GalleryName } from "./queries";

export function galleryPhotos(name: GalleryName): GalleryPhoto[] {
  return getGallery(name).map((img) => ({
    id: img.id,
    src: mediaUrl(img.file),
    alt: img.alt,
    width: img.width,
    height: img.height,
    blurDataUrl: img.blurDataUrl,
  }));
}
