import type { Product } from "@/types/product";
import type { Collection } from "@/types/collection";
import type {
  HeroBannerData,
  FeaturedSectionData,
  EditorialBannerData,
  StorySectionData,
} from "@/types/cms";
import type { CreateOrderPayload, Order } from "@/types/order";
import {
  MOCK_PRODUCTS,
  MOCK_COLLECTIONS,
  DEFAULT_HERO_BANNER,
  DEFAULT_FEATURED_SECTION,
  DEFAULT_EDITORIAL_BANNER,
  DEFAULT_STORY_SECTION,
  DEFAULT_BOTTOM_BANNER,
} from "./data/mock-data";

export interface PaginatedProducts {
  products: Product[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

const API_BASE_URL =
  process.env.SERVER_URL ||
  process.env.API_URL ||
  "";

async function fetchFromApi<T>(
  path: string,
  options?: RequestInit,
): Promise<T | null> {
  if (!API_BASE_URL) return null;

  try {
    const url = `${API_BASE_URL.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { revalidate: 60 },
      ...options,
    });

    if (!res.ok) {
      console.warn(`[API] ${path} returned status ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch ${path} from backend:`, err);
    return null;
  }
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const remote = await fetchFromApi<{ products?: Product[] } | Product[]>(
    "/api/products",
  );

  if (Array.isArray(remote) && remote.length > 0) return remote;
  if (remote && "products" in remote && Array.isArray(remote.products) && remote.products.length > 0) {
    return remote.products;
  }

  return MOCK_PRODUCTS;
}

export async function getProductsPaginated({
  first,
  after,
}: {
  first: number;
  after?: string | null;
}): Promise<PaginatedProducts> {
  const query = new URLSearchParams({ first: first.toString() });
  if (after) query.set("after", after);

  const remote = await fetchFromApi<PaginatedProducts>(
    `/api/products?${query.toString()}`,
  );

  if (remote?.products && Array.isArray(remote.products)) {
    return remote;
  }

  // Local fallback pagination over mock products
  const all = MOCK_PRODUCTS;
  const startIndex = after ? all.findIndex((p) => p.id === after) + 1 : 0;
  const safeStart = Math.max(0, startIndex);
  const slice = all.slice(safeStart, safeStart + first);
  const hasNextPage = safeStart + first < all.length;
  const hasPreviousPage = safeStart > 0;

  return {
    products: slice,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: slice.length > 0 ? slice[0].id : null,
      endCursor: slice.length > 0 ? slice[slice.length - 1].id : null,
    },
  };
}

export async function getProductByHandle(
  handle: string,
): Promise<Product | null> {
  const remote = await fetchFromApi<{ product?: Product } | Product>(
    `/api/products/${encodeURIComponent(handle)}`,
  );

  if (remote) {
    if ("product" in remote && remote.product) return remote.product;
    if ("id" in remote) return remote as Product;
  }

  return (
    MOCK_PRODUCTS.find(
      (p) => p.handle.toLowerCase() === handle.toLowerCase(),
    ) ?? null
  );
}

export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query?.trim().toLowerCase();
  if (!trimmed) return [];

  const remote = await fetchFromApi<{ products: Product[] } | Product[]>(
    `/api/products/search?q=${encodeURIComponent(trimmed)}`,
  );

  if (Array.isArray(remote)) return remote;
  if (remote?.products && Array.isArray(remote.products)) return remote.products;

  // Local search fallback
  return MOCK_PRODUCTS.filter((p) => {
    const inTitle = p.title.toLowerCase().includes(trimmed);
    const inTags = p.tags?.some((t) => t.toLowerCase().includes(trimmed));
    const inDesc = p.descriptionHtml.toLowerCase().includes(trimmed);
    return inTitle || inTags || inDesc;
  });
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  const remote = await fetchFromApi<{ collections?: Collection[] } | Collection[]>(
    "/api/collections",
  );

  if (Array.isArray(remote) && remote.length > 0) return remote;
  if (
    remote &&
    "collections" in remote &&
    Array.isArray(remote.collections) &&
    remote.collections.length > 0
  ) {
    return remote.collections;
  }

  return MOCK_COLLECTIONS;
}

export async function getCollectionByHandle(
  handle: string,
): Promise<Collection | null> {
  const remote = await fetchFromApi<{ collection?: Collection } | Collection>(
    `/api/collections/${encodeURIComponent(handle)}`,
  );

  if (remote) {
    if ("collection" in remote && remote.collection) return remote.collection;
    if ("id" in remote) return remote as Collection;
  }

  const found = MOCK_COLLECTIONS.find(
    (c) => c.handle.toLowerCase() === handle.toLowerCase(),
  );

  if (!found) return null;

  // Ensure collection has its products populated
  if (!found.products || found.products.length === 0) {
    return {
      ...found,
      products: MOCK_PRODUCTS.filter((p) =>
        p.tags?.some((t) => t.toLowerCase() === handle.toLowerCase()),
      ),
    };
  }

  return found;
}

// ─── CMS Content ─────────────────────────────────────────────────────────────

export async function getHeroBanner(): Promise<HeroBannerData | null> {
  const remote = await fetchFromApi<HeroBannerData>("/api/cms/hero");
  return remote || DEFAULT_HERO_BANNER;
}

export async function getFeaturedSection(): Promise<FeaturedSectionData | null> {
  const remote = await fetchFromApi<FeaturedSectionData>("/api/cms/featured");
  return remote || DEFAULT_FEATURED_SECTION;
}

export async function getEditorialBanner(): Promise<EditorialBannerData | null> {
  const remote = await fetchFromApi<EditorialBannerData>("/api/cms/editorial");
  return remote || DEFAULT_EDITORIAL_BANNER;
}

export async function getStorySection(): Promise<StorySectionData | null> {
  const remote = await fetchFromApi<StorySectionData>("/api/cms/story");
  return remote || DEFAULT_STORY_SECTION;
}

export async function getBottomBanner(): Promise<EditorialBannerData | null> {
  const remote = await fetchFromApi<EditorialBannerData>("/api/cms/bottom-banner");
  return remote || DEFAULT_BOTTOM_BANNER;
}

// ─── Orders / Checkout ───────────────────────────────────────────────────────

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<{ success: boolean; order: Order; message?: string }> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        return {
          success: true,
          order: json.order || json,
          message: "Order placed successfully",
        };
      }
    } catch (err) {
      console.warn("[API] Failed to submit order to backend, falling back to local:", err);
    }
  }

  // Local simulated order creation for development/standalone mode
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const simulatedOrder: Order = {
    ...payload,
    id: `ord_${Date.now()}_${randomSuffix}`,
    orderNumber: `DD-${Date.now().toString().slice(-5)}-${randomSuffix}`,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    order: simulatedOrder,
    message: "Order placed successfully (local mode)",
  };
}
