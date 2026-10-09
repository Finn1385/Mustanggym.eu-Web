import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.url({ protocol: /^https?$/ })]);

export const siteSchema = z.object({
  name: z.string().trim().min(1),
  tagline: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(6),
  email: z.email(),
  street: z.string().trim().min(1),
  zip: z.string().trim().min(3),
  city: z.string().trim().min(1),
  mapsUrl: optionalUrl,
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  facebook: optionalUrl,
  instagram: optionalUrl,
  multisport: z.boolean(),
});

export const featureSchema = z.object({
  icon: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  text: z.string().trim().max(400),
});

export const fitnessPageSchema = z.object({
  intro: z.string().trim().max(400),
  features: z.array(featureSchema).max(8),
});

export const treningyPageSchema = z.object({
  intro: z.string().trim().max(400),
});

/** Which gallery image each page uses as its hero. */
export const heroesSchema = z.object({
  home: z.number().int().nullable(),
  fitness: z.number().int().nullable(),
  treningy: z.number().int().nullable(),
});

export const settingSchemas = {
  site: siteSchema,
  fitness: fitnessPageSchema,
  treningy: treningyPageSchema,
  heroes: heroesSchema,
} as const;

export type SettingKey = keyof typeof settingSchemas;
export type SettingValue<K extends SettingKey> = z.infer<(typeof settingSchemas)[K]>;
export type Site = SettingValue<"site">;
export type Feature = z.infer<typeof featureSchema>;

export const settingDefaults: { [K in SettingKey]: SettingValue<K> } = {
  site: {
    name: "Mustang Gym",
    tagline: "Rozlohou najväčšie fitness centrum v Snine",
    phone: "+421 905 446 393",
    email: "korzo.sv@gmail.com",
    street: "Strojárska 607",
    zip: "069 01",
    city: "Snina",
    mapsUrl: "https://goo.gl/maps/wDNiExqBfGkKN6dy6",
    lat: null,
    lng: null,
    facebook: "https://www.facebook.com/mustanggymsnina",
    instagram: "https://www.instagram.com/mustanggymsnina",
    multisport: true,
  },
  fitness: {
    intro:
      "Na 800 m² nájdete kardio zónu, posilňovňu, činkáreň, miestnosť na drepy aj funkčnú zónu.",
    features: [
      {
        icon: "maximize",
        title: "Rozlohou najväčšie fitness centrum v Snine",
        text: "Na rozlohe 800 m² vám ponúkame kardio zónu, fitness zónu, činkáreň, miestnosť na drepy, funkčnú zónu a omnoho viac.",
      },
      {
        icon: "dumbbell",
        title: "Tréningy pod vedením certifikovaného trénera",
        text: "Kruhový tréning, Strong Body, Body Forming a ďalšie skupinové hodiny počas celého týždňa.",
      },
      {
        icon: "credit-card",
        title: "Karta MultiSport",
        text: "U nás akceptujeme kartu MultiSport.",
      },
    ],
  },
  treningy: {
    intro: "Skupinové hodiny pod vedením certifikovaného trénera. Stačí prísť pár minút pred začiatkom.",
  },
  heroes: { home: null, fitness: null, treningy: null },
};
