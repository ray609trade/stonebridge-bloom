import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { LocationSection } from "@/components/home/LocationSection";
import { CartDrawer } from "@/components/cart/CartDrawer";

const Index = () => {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
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
