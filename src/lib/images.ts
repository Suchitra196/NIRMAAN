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
    { slot: "gallery-1", label: "Works & Construction", src: "C:\Users\DELL\OneDrive\New folder\NIRMAAN Project\gpoms-app\landing page images\works and construction.jpg" },
    { slot: "gallery-2", label: "Agriculture Projects", src: "C:\Users\DELL\OneDrive\New folder\NIRMAAN Project\gpoms-app\landing page images\Agricultural projects.jpg" },
    { slot: "gallery-3", label: "Health Infrastructure", src: "C:\Users\DELL\OneDrive\New folder\NIRMAAN Project\gpoms-app\landing page images\healthcare infrastructure.jpg" },
    { slot: "gallery-4", label: "Education Buildings", src: "C:\Users\DELL\OneDrive\New folder\NIRMAAN Project\gpoms-app\landing page images\educational buildings.jpg" },
    { slot: "gallery-5", label: "Water Supply", src: "C:\Users\DELL\OneDrive\New folder\NIRMAAN Project\gpoms-app\landing page images\water supply.jpg" },
    { slot: "gallery-6", label: "Rural Development", src: "C:\Users\DELL\OneDrive\New folder\NIRMAAN Project\gpoms-app\landing page images\rural development.jpg" },
  ],
} as const;
