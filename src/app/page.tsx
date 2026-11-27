import {
  getProducts,
  getHeroBanner,
  getFeaturedSection,
  getEditorialBanner,
  getStorySection,
  getBottomBanner,
} from "@/lib/api";
import { HeroSection } from "@/components/sections/home/hero-section";
import { FeaturedCollectionsSection } from "@/components/sections/home/featured-collections-section";
import { EditorialBanner } from "@/components/sections/home/editorial-banner";
import { StorySection } from "@/components/sections/home/story-section";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [products, heroData, featuredData, editorialData, storyData, bottomData] =
    await Promise.all([
      getProducts(),
      getHeroBanner(),
      getFeaturedSection(),
      getEditorialBanner(),
      getStorySection(),
      getBottomBanner(),
    ]);

  return (
    <>
      <HeroSection heroData={heroData} />

      <FeaturedCollectionsSection
        products={products}
        featuredData={featuredData}
      />

      <EditorialBanner
        imageUrl={
          editorialData?.imageUrl ||
          "https://res.cloudinary.com/io2tbyjp/image/upload/v1795766216/dainty-dazzle/dainty-dazzle/02-editorial-banner-elegance.jpg"
        }
        imageAlt="Elegant gold jewelry editorial"
        headline={editorialData?.headline || "Elegance in every detail."}
        subtitle={
          editorialData?.subtitle ||
          "Handcrafted with love, designed to be worn every single day."
        }
        align="left"
      />

      <StorySection storyData={storyData} />

      <EditorialBanner
        imageUrl={
          bottomData?.imageUrl ||
          "https://res.cloudinary.com/io2tbyjp/image/upload/v1795766221/dainty-dazzle/dainty-dazzle/04-editorial-banner-technique.jpg"
        }
        imageAlt="Gold earrings close-up editorial"
        headline={bottomData?.headline || "Emotion embraces technique."}
        subtitle={
          bottomData?.subtitle ||
          "Where craftsmanship meets quiet confidence."
        }
        align="right"
      />
    </>
  );
}
