import { ClosingCta } from "@/components/landing/closing-cta/closing-cta";
import { DetailsGrid } from "@/components/landing/details-grid/details-grid";
import { FeatureBeats } from "@/components/landing/feature-beats/feature-beats";
import { Hero } from "@/components/landing/hero/hero";
import { HowItWorks } from "@/components/landing/how-it-works/how-it-works";
import { SiteFooter } from "@/components/landing/footer/site-footer";
import { SiteNav } from "@/components/landing/nav/site-nav";
import { Testimonials } from "@/components/landing/testimonials/testimonials";
import { TripPreview } from "@/components/landing/trip-preview/trip-preview";

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <TripPreview />
        <FeatureBeats />
        <HowItWorks />
        <DetailsGrid />
        <Testimonials />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
