import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { LocationSection } from "@/components/home/LocationSection";
import { CartDrawer } from "@/components/cart/CartDrawer";

const Index = () => {
  return (
    <div className="min-h-screen">
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
    </div>
  );
};

export default Index;
