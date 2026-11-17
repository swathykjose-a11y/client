import type { Product } from "@/types/product";
import type { Collection } from "@/types/collection";
import type {
  HeroBannerData,
  FeaturedSectionData,
  EditorialBannerData,
  StorySectionData,
} from "@/types/cms";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_01",
    handle: "golden-aura-twisted-hoops",
    title: "Golden Aura Twisted Hoops",
    descriptionHtml:
      "<p>Sculptural twisted hoop earrings crafted with 18k gold vermeil over sterling silver. Designed to catch light with every turn, adding effortless warmth and modern elegance to any outfit.</p><p>Hypoallergenic, water-resistant, and lightweight for all-day comfort.</p>",
    availableForSale: true,
    totalInventory: 25,
    tags: ["earrings", "new", "gold", "hoops"],
    priceRange: {
      minVariantPrice: { amount: "899", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "1499", currencyCode: "INR" },
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1200&q=85&auto=format&fit=crop",
        altText: "Golden Aura Twisted Hoops fine jewelry",
      },
      {
        url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=85&auto=format&fit=crop",
        altText: "Golden Aura Twisted Hoops model view",
      },
    ],
    variants: [
      {
        id: "var_01_gold",
        title: "18K Gold Vermeil",
        availableForSale: true,
        quantityAvailable: 15,
        price: { amount: "899", currencyCode: "INR" },
        compareAtPrice: { amount: "1499", currencyCode: "INR" },
      },
      {
        id: "var_01_silver",
        title: "Sterling Silver",
        availableForSale: true,
        quantityAvailable: 10,
        price: { amount: "849", currencyCode: "INR" },
        compareAtPrice: { amount: "1399", currencyCode: "INR" },
      },
    ],
  },
  {
    id: "prod_02",
    handle: "celestial-freshwater-pearl-pendant",
    title: "Celestial Freshwater Pearl Pendant",
    descriptionHtml:
      "<p>An organic, luminous genuine freshwater baroque pearl suspended from a delicate Singapore twist chain. Each pearl is hand-selected and unique, embodying natural, unrepeatable grace.</p><p>Adjustable chain length: 16 to 18 inches.</p>",
    availableForSale: true,
    totalInventory: 18,
    tags: ["necklaces", "pearl", "sale", "bestseller"],
    priceRange: {
      minVariantPrice: { amount: "1299", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "1899", currencyCode: "INR" },
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=85&auto=format&fit=crop",
        altText: "Celestial Freshwater Pearl Pendant fine necklace",
      },
      {
        url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=85&auto=format&fit=crop",
        altText: "Pearl pendant details close up",
      },
    ],
    variants: [
      {
        id: "var_02_gold",
        title: "Yellow Gold & Pearl",
        availableForSale: true,
        quantityAvailable: 12,
        price: { amount: "1299", currencyCode: "INR" },
        compareAtPrice: { amount: "1899", currencyCode: "INR" },
      },
      {
        id: "var_02_rose",
        title: "Rose Gold & Pearl",
        availableForSale: true,
        quantityAvailable: 6,
        price: { amount: "1299", currencyCode: "INR" },
        compareAtPrice: { amount: "1899", currencyCode: "INR" },
      },
    ],
  },
  {
    id: "prod_03",
    handle: "solstice-textured-huggies",
    title: "Solstice Textured Huggies",
    descriptionHtml:
      "<p>Everyday mini huggie hoops featuring an artisanal hammered texture that captures subtle reflections. Designed with a secure click clasp for seamless daily wear.</p><p>Diameter: 12mm. Crafted in anti-tarnish stainless steel with triple gold dipping.</p>",
    availableForSale: true,
    totalInventory: 30,
    tags: ["earrings", "gold", "huggies", "bestseller"],
    priceRange: {
      minVariantPrice: { amount: "749", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "1199", currencyCode: "INR" },
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=85&auto=format&fit=crop",
        altText: "Solstice Textured Huggie Earrings",
      },
    ],
    variants: [
      {
        id: "var_03_default",
        title: "One Size / Gold",
        availableForSale: true,
        quantityAvailable: 30,
        price: { amount: "749", currencyCode: "INR" },
        compareAtPrice: { amount: "1199", currencyCode: "INR" },
      },
    ],
  },
  {
    id: "prod_04",
    handle: "serpentine-herringbone-chain",
    title: "Serpentine Herringbone Snake Chain",
    descriptionHtml:
      "<p>Liquid gold drape. This flat-woven serpentine chain rests flush against the collarbone with mirror-like shine. Striking when worn alone or paired with delicate charms.</p><p>Width: 3mm. Length: 40cm + 5cm extension.</p>",
    availableForSale: true,
    totalInventory: 20,
    tags: ["necklaces", "chains", "new", "gold"],
    priceRange: {
      minVariantPrice: { amount: "1199", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "1699", currencyCode: "INR" },
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1200&q=85&auto=format&fit=crop",
        altText: "Serpentine Herringbone Snake Chain Necklace",
      },
    ],
    variants: [
      {
        id: "var_04_gold",
        title: "Gold - 40cm",
        availableForSale: true,
        quantityAvailable: 15,
        price: { amount: "1199", currencyCode: "INR" },
        compareAtPrice: { amount: "1699", currencyCode: "INR" },
      },
      {
        id: "var_04_silver",
        title: "Silver - 40cm",
        availableForSale: true,
        quantityAvailable: 5,
        price: { amount: "1099", currencyCode: "INR" },
        compareAtPrice: { amount: "1599", currencyCode: "INR" },
      },
    ],
  },
  {
    id: "prod_05",
    handle: "baroque-radiance-drop-earrings",
    title: "Baroque Radiance Drop Earrings",
    descriptionHtml:
      "<p>Statement drop earrings featuring twin baroque freshwater pearls suspended from molten gold droplets. Vintage-inspired romance crafted for celebrations and everyday grandeur.</p>",
    availableForSale: true,
    totalInventory: 14,
    tags: ["earrings", "pearl", "statement"],
    priceRange: {
      minVariantPrice: { amount: "999", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "1599", currencyCode: "INR" },
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=85&auto=format&fit=crop",
        altText: "Baroque Radiance Drop Earrings",
      },
    ],
    variants: [
      {
        id: "var_05_gold",
        title: "Gold & Pearl",
        availableForSale: true,
        quantityAvailable: 14,
        price: { amount: "999", currencyCode: "INR" },
        compareAtPrice: { amount: "1599", currencyCode: "INR" },
      },
    ],
  },
  {
    id: "prod_06",
    handle: "starlight-layering-choker",
    title: "Starlight Delicate Layering Choker",
    descriptionHtml:
      "<p>A whisper-thin trace chain studded with tiny faceted celestial droplets. Glints gently in natural light, making it the perfect foundation for your daily jewelry stack.</p>",
    availableForSale: true,
    totalInventory: 22,
    tags: ["necklaces", "delicate", "bestseller"],
    priceRange: {
      minVariantPrice: { amount: "849", currencyCode: "INR" },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "1299", currencyCode: "INR" },
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=85&auto=format&fit=crop",
        altText: "Starlight Delicate Layering Choker Necklace",
      },
    ],
    variants: [
      {
        id: "var_06_gold",
        title: "Gold",
        availableForSale: true,
        quantityAvailable: 14,
        price: { amount: "849", currencyCode: "INR" },
        compareAtPrice: { amount: "1299", currencyCode: "INR" },
      },
      {
        id: "var_06_silver",
        title: "Silver",
        availableForSale: true,
        quantityAvailable: 8,
        price: { amount: "799", currencyCode: "INR" },
        compareAtPrice: { amount: "1199", currencyCode: "INR" },
      },
    ],
  },
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col_earrings",
    handle: "earrings",
    title: "Earrings",
    description:
      "Handcrafted hoops, huggies, drops, and studs designed for effortless everyday wear.",
    image: {
      url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1200&q=85&auto=format&fit=crop",
      altText: "Dainty Dazzle Earrings Collection",
    },
    products: MOCK_PRODUCTS.filter((p) => p.tags?.includes("earrings")),
  },
  {
    id: "col_necklaces",
    handle: "necklaces",
    title: "Necklaces",
    description:
      "Sculptural chains, luminous pearl pendants, and dainty chokers to layer or wear alone.",
    image: {
      url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=85&auto=format&fit=crop",
      altText: "Dainty Dazzle Necklaces Collection",
    },
    products: MOCK_PRODUCTS.filter((p) => p.tags?.includes("necklaces")),
  },
  {
    id: "col_new_arrivals",
    handle: "new-arrivals",
    title: "New Arrivals",
    description:
      "Freshly added designs reflecting understated luxury and contemporary elegance.",
    image: {
      url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=85&auto=format&fit=crop",
      altText: "Dainty Dazzle New Arrivals",
    },
    products: MOCK_PRODUCTS.filter((p) => p.tags?.includes("new")),
  },
];

export const DEFAULT_HERO_BANNER: HeroBannerData = {
  imageUrl:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&q=85&auto=format&fit=crop",
  headline: "Dainty Dazzle",
  subtitle:
    "True beauty shines from within, and our jewelry merely reflects it.",
  ctaText: "SHOP NOW ↗",
  ctaLink: "/products",
};

export const DEFAULT_FEATURED_SECTION: FeaturedSectionData = {
  eyebrow: "Our Collection",
  headline: "Creating,\nCrafting\n& Wearing.",
  description:
    "Each piece is designed with care and crafted to celebrate everyday elegance. Discover jewelry that feels like it was made just for you.",
  ctaText: "EXPLORE ALL ↗",
  ctaLink: "/products",
};

export const DEFAULT_EDITORIAL_BANNER: EditorialBannerData = {
  imageUrl:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&q=85&auto=format&fit=crop",
  headline: "Elegance in every detail.",
  subtitle: "Handcrafted with love, designed to be worn every single day.",
};

export const DEFAULT_STORY_SECTION: StorySectionData = {
  imageUrl:
    "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=85&auto=format&fit=crop",
  eyebrow: "Our Story",
  headline: "We believe\nin our process.",
  paragraph1:
    "Every piece of Dainty Dazzle jewelry is crafted with intention. From selecting materials to the final polish, we pour care into every step. Our designs are rooted in simplicity and made to be worn every day, because true elegance is effortless.",
  paragraph2:
    "We started with a simple belief: that beautiful jewelry shouldn't cost a fortune. Each piece is designed in India and made to celebrate the quiet confidence of the women who wear them.",
  ctaText: "EXPLORE CATEGORIES ↗",
  ctaLink: "/products",
};

export const DEFAULT_BOTTOM_BANNER: EditorialBannerData = {
  imageUrl:
    "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1920&q=85&auto=format&fit=crop",
  headline: "Emotion embraces technique.",
  subtitle: "Where craftsmanship meets quiet confidence.",
};
