// Landing page image configuration
// To add or replace images:
//   1. Drop the file into public/images/
//   2. Update the src value below to "/images/your-file.jpg"
//   3. Set src to null to revert to the gradient/gray placeholder

export interface ImageSlot {
  slot: string;
  label: string;
  src: string | null;
}

export const LANDING_IMAGES: {
  hero: ImageSlot[];
  about: ImageSlot;
  gallery: ImageSlot[];
} = {
  hero: [
    { slot: "hero-1", label: "Hero Banner 1", src: null },
    { slot: "hero-2", label: "Hero Banner 2", src: null },
    { slot: "hero-3", label: "Hero Banner 3", src: null },
  ],
  about: { slot: "about", label: "About NIRMAAN", src: null },
  gallery: [
    { slot: "gallery-1", label: "Works & Construction",  src: "/images/gallery-1.jpg" },
    { slot: "gallery-2", label: "Agriculture Projects",  src: "/images/gallery-2.jpg" },
    { slot: "gallery-3", label: "Health Infrastructure", src: "/images/gallery-3.jpg" },
    { slot: "gallery-4", label: "Education Buildings",   src: "/images/gallery-4.jpg" },
    { slot: "gallery-5", label: "Water Supply",          src: "/images/gallery-5.jpg" },
    { slot: "gallery-6", label: "Rural Development",     src: "/images/gallery-6.jpg" },
  ],
};
