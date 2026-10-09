import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/ui";
import { getGallery, getSetting, mediaUrl } from "@/lib/content/queries";
import { GalleryManager } from "./gallery-manager";
import { UploadForm } from "./upload-form";

const GALLERIES = {
  fitness: { title: "Galéria fitness", view: "/fitness", heroPages: ["home", "fitness"] as const },
  treningy: { title: "Galéria tréningy", view: "/treningy", heroPages: ["home", "treningy"] as const },
};

export async function generateMetadata({ params }: PageProps<"/admin/galeria/[gallery]">) {
  const { gallery } = await params;
  return { title: GALLERIES[gallery as keyof typeof GALLERIES]?.title ?? "Galéria" };
}

export default async function GalleryPage({ params }: PageProps<"/admin/galeria/[gallery]">) {
  const { gallery } = await params;
  if (!(gallery in GALLERIES)) notFound();
  const name = gallery as keyof typeof GALLERIES;
  const config = GALLERIES[name];
  const photos = getGallery(name).map((p) => ({ id: p.id, src: mediaUrl(p.file), alt: p.alt, blurDataUrl: p.blurDataUrl }));
  return (
    <>
      <PageTitle
        title={config.title}
        description="Fotky sa automaticky zmenšia a skonvertujú do WebP. Popis fotky čítajú nevidiaci aj Google, píšte, čo je na fotke."
      />
      <div className="space-y-6">
        <UploadForm gallery={name} />
        <GalleryManager
          key={photos.map((p) => p.id).join(",")}
          gallery={name}
          photos={photos}
          heroes={getSetting("heroes")}
          heroPages={[...config.heroPages]}
          viewHref={config.view}
        />
      </div>
    </>
  );
}
