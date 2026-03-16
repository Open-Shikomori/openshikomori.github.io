import { ContactSection } from "@/features/marketing/ContactSection";
import { HeroSection } from "@/features/marketing/HeroSection";
import { ProgressSection } from "@/features/marketing/ProgressSection";
import { RoadmapSection } from "@/features/marketing/RoadmapSection";
import { TrustSection } from "@/features/marketing/TrustSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ProgressSection />
      <TrustSection />
      <RoadmapSection />
      <ContactSection />
    </>
  );
}
