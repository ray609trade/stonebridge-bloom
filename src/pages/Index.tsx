import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { LocationSection } from "@/components/home/LocationSection";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <SEOHead
        title="Stonebridge Bagels & Deli | Fresh NY-Style Bagels in Allentown NJ"
        description="Handcrafted New York-style boiled bagels baked fresh daily in Allentown, NJ. Order pickup, buy by the dozen, or cater your next event. Family-owned since 2013."
        path="/"
      />
      <Header />
      <CartDrawer />
      <main>
        <Hero />
        <FeaturedProducts />
        <HowItWorks />
        <Testimonials />
        <LocationSection />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
