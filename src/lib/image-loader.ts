/**
 * Custom Next.js Image Loader
 *
 * Directs image delivery directly to Cloudinary and Unsplash CDNs with
 * automatic format negotiation (f_auto / AVIF / WebP) and quality optimization (q_auto).
 *
 * Benefits:
 * 1. Zero Vercel bandwidth consumption: Image requests bypass Vercel's serverless image optimization function entirely.
 * 2. 70-80% lower Cloudinary bandwidth: Cloudinary delivers modern, compressed AVIF/WebP sized precisely to the screen.
 * 3. Global Edge Caching: Leverages Cloudinary's Akamai/Fastly CDN multi-tier edge cache.
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src) return "";

  // ─── 1. Cloudinary Direct CDN Delivery ───────────────────────────────────────
  if (src.includes("res.cloudinary.com")) {
    const uploadIndex = src.indexOf("/upload/");
    if (uploadIndex !== -1) {
      const prefix = src.slice(0, uploadIndex + 8);
      let rest = src.slice(uploadIndex + 8);

      // Strip existing transformation parameters if already applied
      rest = rest.replace(/^(f_auto,q_auto[^/]*\/)+/i, "");
      rest = rest.replace(/^([a-z]_[^/]+\/)+/i, (match) => {
        // If it starts with transformations like c_scale,w_... strip them
        if (match.includes("w_") || match.includes("q_") || match.includes("f_")) {
          return "";
        }
        return match;
      });

      const q = quality ? `q_${quality}` : "q_auto";
      // Deliver f_auto (AVIF/WebP), q_auto, capped at exact viewport width
      return `${prefix}f_auto,${q},w_${width},c_limit/${rest}`;
    }
  }

  // ─── 2. Unsplash Direct CDN Delivery ─────────────────────────────────────────
  if (src.includes("images.unsplash.com")) {
    try {
      const url = new URL(src);
      url.searchParams.set("w", width.toString());
      url.searchParams.set("q", (quality || 75).toString());
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      return url.toString();
    } catch {
      return src;
    }
  }

  // ─── 3. Local or Third-Party Direct Pass-through ─────────────────────────────
  return src;
}
