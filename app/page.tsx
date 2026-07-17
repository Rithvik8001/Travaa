import { Bento } from "@/components/landing/bento/bento";
import { ClosingCta } from "@/components/landing/closing-cta/closing-cta";
import { DetailsGrid } from "@/components/landing/details-grid/details-grid";
import { FeatureIndex } from "@/components/landing/feature-index/feature-index";
import { Hero } from "@/components/landing/hero/hero";
import { HowItWorks } from "@/components/landing/how-it-works/how-it-works";
import { SiteFooter } from "@/components/landing/footer/site-footer";
import { SiteNav } from "@/components/landing/nav/site-nav";
import { Testimonials } from "@/components/landing/testimonials/testimonials";

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Bento />
        <FeatureIndex />
        <HowItWorks />
        <DetailsGrid />
        <Testimonials />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
