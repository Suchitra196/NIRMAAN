// Landing page image configuration
// When src is null, placeholder will be rendered
// Update src values to add actual images

export const LANDING_IMAGES = {
  hero: [
    { slot: "hero-1", label: "Hero Banner 1", src: null as string | null },
    { slot: "hero-2", label: "Hero Banner 2", src: null as string | null },
    { slot: "hero-3", label: "Hero Banner 3", src: null as string | null },
  ],
  about: { slot: "about", label: "About NIRMAAN", src: null as string | null },
  gallery: [
    { slot: "gallery-1", label: "Works & Construction", src: null as string | null },
    { slot: "gallery-2", label: "Agriculture Projects", src: null as string | null },
    { slot: "gallery-3", label: "Health Infrastructure", src: null as string | null },
    { slot: "gallery-4", label: "Education Buildings", src: null as string | null },
    { slot: "gallery-5", label: "Water Supply", src: null as string | null },
    { slot: "gallery-6", label: "Rural Development", src: null as string | null },
  ],
} as const;
