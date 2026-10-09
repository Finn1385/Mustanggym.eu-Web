/**
 * One-off: converts the photos of the old static site into optimised seed media
 * (db/seed-media/*.webp + manifest.json). Run with: npx tsx scripts/prepare-seed-media.ts <legacy images dir>
 */
import fs from "node:fs";
import path from "node:path";
import { processImage } from "../lib/images";

const src = process.argv[2];
const out = path.resolve("db/seed-media");

const photos: { gallery: "fitness" | "treningy"; from: string; name: string; alt: string }[] = [
  { gallery: "fitness", from: "bg-fitness.jpg", name: "fitness-hero", alt: "Posilňovňa Mustang Gym so strojmi a činkami" },
  { gallery: "fitness", from: "fitness/1.jpg", name: "fitness-01", alt: "Kardio zóna s rotopedmi a eliptickými trenažérmi" },
  { gallery: "fitness", from: "fitness/2.jpg", name: "fitness-02", alt: "Bežecké pásy v kardio zóne" },
  { gallery: "fitness", from: "fitness/3.jpg", name: "fitness-03", alt: "Posilňovacie stroje pod logom Mustang Gym" },
  { gallery: "fitness", from: "fitness/4.jpg", name: "fitness-04", alt: "Kladkové stroje a posilňovacie lavice" },
  { gallery: "fitness", from: "fitness/5.jpg", name: "fitness-05", alt: "Leg press a stroje na nohy" },
  { gallery: "fitness", from: "fitness/6.jpg", name: "fitness-06", alt: "Lavica na tlak s olympijskou osou" },
  { gallery: "fitness", from: "fitness/7.jpg", name: "fitness-07", alt: "Zrkadlová stena s činkami a kettlebellmi" },
  { gallery: "fitness", from: "fitness/8.jpg", name: "fitness-08", alt: "Stojan s jednoručkami pri zrkadle" },
  { gallery: "fitness", from: "fitness/9.jpg", name: "fitness-09", alt: "Klietka na drepy s kotúčmi" },
  { gallery: "fitness", from: "fitness/10.jpg", name: "fitness-10", alt: "Multipress a lavice v činkárni" },
  { gallery: "fitness", from: "fitness/11.jpg", name: "fitness-11", alt: "Kladkové stroje pri stene s logom" },
  { gallery: "fitness", from: "fitness/12.jpg", name: "fitness-12", alt: "Nástenná maľba Hulka na tehlovej stene" },
  { gallery: "treningy", from: "bg-treningy.jpg", name: "treningy-hero", alt: "Sála na skupinové tréningy s plyometrickými boxami" },
  { gallery: "treningy", from: "treningy/1.jpg", name: "treningy-01", alt: "Sála na skupinové tréningy s oranžovými stenami" },
  { gallery: "treningy", from: "treningy/2.jpg", name: "treningy-02", alt: "Regál s medicinbalmi a kettlebellmi" },
  { gallery: "treningy", from: "treningy/3.jpg", name: "treningy-03", alt: "Sála na tréningy s logom Mustang Gym na stene" },
  { gallery: "treningy", from: "treningy/4.jpg", name: "treningy-04", alt: "Funkčná zóna s boxami a posilňovacími strojmi" },
];

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const manifest = [];
  for (const p of photos) {
    const img = await processImage(fs.readFileSync(path.join(src, p.from)));
    const file = `${p.name}.webp`;
    fs.writeFileSync(path.join(out, file), img.data);
    manifest.push({ gallery: p.gallery, file, alt: p.alt, width: img.width, height: img.height, blurDataUrl: img.blurDataUrl });
    console.log(file, img.width, img.height, Math.round(img.data.length / 1024) + "KB");
  }
  fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

main();
