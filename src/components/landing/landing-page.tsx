import { CTASection, FeatureSection, HeroSection, LandingFooter } from "@/components/landing";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <FeatureSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
