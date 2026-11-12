// Five services = five routes = five CMS categories.
export const PROJECT_CATEGORIES = [
  {
    slug: "branding",
    label: "Brand Strategy & Visual Identity",
    short: "Branding",
    icon: "palette",
    accent: "orange",
    color: "#FF5B35",
    heroTitle: ["Brands built", "to mean more."],
    heroDescription:
      "Positioning, naming, logo and identity systems, delivered with the guidelines your team needs to use them.",
    cardText:
      "Brand positioning, strategy, logo design, visual identity systems and brand guidelines.",
    capabilities: [
      "Brand positioning and strategy",
      "Logo design",
      "Visual identity systems",
      "Brand guidelines",
    ],
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "social-media",
    label: "Social Media & Content Creation",
    short: "Social media",
    icon: "share",
    accent: "blue",
    color: "#435BFF",
    heroTitle: ["Content people", "stop scrolling for."],
    heroDescription:
      "Strategy, planning and creative direction for feeds that look like one brand and sound like one voice.",
    cardText:
      "Social media strategy, content planning, creative direction, graphic design and digital content.",
    capabilities: [
      "Social media strategy",
      "Content planning",
      "Creative direction",
      "Graphic design",
      "Digital content creation",
    ],
    image:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "video-production",
    label: "Video Production",
    short: "Video",
    icon: "video",
    accent: "orange",
    color: "#E8344E",
    heroTitle: ["Stories worth", "pressing play on."],
    heroDescription:
      "From concept to final cut: commercial and promotional films, shot and edited with a clear story.",
    cardText:
      "Concept development, filming, commercial and promotional videos, editing and visual storytelling.",
    capabilities: [
      "Concept development",
      "Filming",
      "Commercial videos",
      "Promotional videos",
      "Editing",
      "Visual storytelling",
    ],
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "motion-design",
    label: "Motion Design",
    short: "Motion",
    icon: "motion",
    accent: "blue",
    color: "#8B5CF6",
    heroTitle: ["Design that", "moves with intent."],
    heroDescription:
      "Motion graphics and animated branding that explain ideas faster and make them easier to remember.",
    cardText:
      "Motion graphics, animated branding, kinetic typography, visual animations and dynamic content.",
    capabilities: [
      "Motion graphics",
      "Animated branding",
      "Kinetic typography",
      "Visual animations",
      "Dynamic digital content",
    ],
    image:
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "digital-experience",
    label: "Programming & Digital Experience",
    short: "Digital",
    icon: "web",
    accent: "blue",
    color: "#14B8A6",
    heroTitle: ["Websites and apps", "that work as hard as you."],
    heroDescription:
      "Websites, web applications and interactive experiences, designed and built in the same studio.",
    cardText:
      "Website development, web applications, interactive experiences, UI/UX implementation and digital solutions.",
    capabilities: [
      "Website development",
      "Web applications",
      "Interactive experiences",
      "UI/UX implementation",
      "Digital solutions",
    ],
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
  },
];

export const LEGACY_ALIASES = {
  web: "digital-experience",
  development: "digital-experience",
  dev: "digital-experience",
  programming: "digital-experience",
  "web-development": "digital-experience",
  social: "social-media",
  share: "social-media",
  video: "video-production",
  montage: "video-production",
  motion: "motion-design",
  "motion-graphics": "motion-design",
  design: "branding",
};

const LEGACY_DB_SLUGS = {
  "digital-experience": "web-development",
  "motion-design": "motion-graphics",
};

const normalize = (value = "") => String(value).replace(/^\/+|\/+$/g, "").toLowerCase();

export const CATEGORY_SLUGS = PROJECT_CATEGORIES.map(({ slug }) => slug);

export function getCategoryBySlug(slug) {
  const value = normalize(slug);
  return (
    PROJECT_CATEGORIES.find((category) => category.slug === value) ||
    PROJECT_CATEGORIES.find((category) => category.slug === LEGACY_ALIASES[value])
  );
}

export function getCategorySlugForPath(path) {
  const value = normalize(path);
  if (CATEGORY_SLUGS.includes(value)) return value;
  return LEGACY_ALIASES[value] || null;
}

export function getCategoryDbValues(slug) {
  return [
    slug,
    ...Object.entries(LEGACY_ALIASES)
      .filter(([, canonicalSlug]) => canonicalSlug === slug)
      .map(([legacyValue]) => legacyValue),
  ];
}

export function getCategoryDbSlug(slug) {
  return LEGACY_DB_SLUGS[slug] || slug;
}
