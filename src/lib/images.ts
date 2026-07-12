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
    { slot: "hero-1", label: "Hero Banner 1", src: "/images/hero banner 1.jpg" },
    { slot: "hero-2", label: "Hero Banner 2", src: "/images/hero banner 2.jpg" },
    { slot: "hero-3", label: "Hero Banner 3", src: "/images/hero banner 3.jpg" },
  ],
  about: { slot: "about", label: "About NIRMAAN", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuByyJ7xYLb9uzMxMCbnpc6HZWc6lE5564hI04IexbvqVtY7aR8JOuSzZDfH2gJHFbM6zVxl9wJcXVzfTnT5_0XX3ZPZZnf_B23RJEhFdEjw7XR5GH4gTa1MXAAgjmwhQHSNFVP06GEju49_D0K2DsFHBjZAzUqK5wNb02ipP9YIV3M-E2NbTGD99P_pvjF3n2RQatvTMVZDcmypCTF_TKgbj4Tlhrg9NSMui7XbnhvQRSstaeu17opOh8dsWmwJA2eC3sXl00AVvg" },
  gallery: [
    { slot: "gallery-1", label: "Works & Construction",  src: "/images/gallery-1.jpg" },
    { slot: "gallery-2", label: "Agriculture Projects",  src: "/images/gallery-2.jpg" },
    { slot: "gallery-3", label: "Health Infrastructure", src: "/images/gallery-3.jpg" },
    { slot: "gallery-4", label: "Education Buildings",   src: "/images/gallery-4.jpg" },
    { slot: "gallery-5", label: "Water Supply",          src: "/images/gallery-5.jpg" },
    { slot: "gallery-6", label: "Rural Development",     src: "/images/gallery-6.jpg" },
  ],
};
