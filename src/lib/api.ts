import type { Product } from "@/types/product";
import type { Collection } from "@/types/collection";
import type {
  HeroBannerData,
  FeaturedSectionData,
  EditorialBannerData,
  StorySectionData,
} from "@/types/cms";
import type { CreateOrderPayload, Order, UpiPaymentInstructions } from "@/types/order";

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
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.SERVER_URL ||
  "https://api.daintydazzle.store";

async function fetchFromApi<T>(
  path: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    const url = `${API_BASE_URL.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
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
    "/api/products?first=100",
  );

  if (Array.isArray(remote)) return remote;
  if (remote && "products" in remote && Array.isArray(remote.products)) {
    return remote.products;
  }

  return [];
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

  return {
    products: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
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

  return null;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query?.trim().toLowerCase();
  if (!trimmed) return [];

  const remote = await fetchFromApi<{ products: Product[] } | Product[]>(
    `/api/products/search?q=${encodeURIComponent(trimmed)}`,
  );

  if (Array.isArray(remote)) return remote;
  if (remote?.products && Array.isArray(remote.products)) return remote.products;

  return [];
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  const remote = await fetchFromApi<{ collections?: Collection[] } | Collection[]>(
    "/api/collections",
  );

  if (Array.isArray(remote)) return remote;
  if (
    remote &&
    "collections" in remote &&
    Array.isArray(remote.collections)
  ) {
    return remote.collections;
  }

  return [];
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

  return null;
}

// ─── CMS Content ─────────────────────────────────────────────────────────────

export async function getHeroBanner(): Promise<HeroBannerData | null> {
  return await fetchFromApi<HeroBannerData>("/api/cms/hero");
}

export async function getFeaturedSection(): Promise<FeaturedSectionData | null> {
  return await fetchFromApi<FeaturedSectionData>("/api/cms/featured");
}

export async function getEditorialBanner(): Promise<EditorialBannerData | null> {
  return await fetchFromApi<EditorialBannerData>("/api/cms/editorial");
}

export async function getStorySection(): Promise<StorySectionData | null> {
  return await fetchFromApi<StorySectionData>("/api/cms/story");
}

export async function getBottomBanner(): Promise<EditorialBannerData | null> {
  return await fetchFromApi<EditorialBannerData>("/api/cms/bottom-banner");
}

export interface StoreShippingSettings {
  freeDeliveryAbove: number;
  deliveryFee: number;
}

export async function getShippingSettings(): Promise<StoreShippingSettings> {
  const data = await fetchFromApi<Partial<StoreShippingSettings>>("/api/cms/shipping");
  return {
    freeDeliveryAbove:
      typeof data?.freeDeliveryAbove === "number" ? data.freeDeliveryAbove : 299,
    deliveryFee:
      typeof data?.deliveryFee === "number" ? data.deliveryFee : 99,
  };
}

// ─── Orders / Checkout ───────────────────────────────────────────────────────

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<{ success: boolean; order: Order; payment?: UpiPaymentInstructions; message?: string }> {
  const { idempotencyKey, ...bodyPayload } = payload;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const res = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/api/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyPayload),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success || !json?.order) {
    const message =
      json?.error?.message ||
      (typeof json?.error === "string" ? json.error : null) ||
      "Failed to place order.";
    throw new Error(message);
  }

  return {
    success: true,
    order: json.order,
    payment: json.payment,
    message: json.message || "Pay by UPI to confirm this order.",
  };
}
