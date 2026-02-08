import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StylistIntro from "@/components/StylistIntro";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import ProfileSection from "@/components/ProfileSection";
import SmartShopping from "@/components/SmartShopping";
import UseCases from "@/components/UseCases";
import Privacy from "@/components/Privacy";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <StylistIntro />
      <Features />
      <HowItWorks />
      <ProfileSection />
      <SmartShopping />
      <UseCases />
      <Privacy />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
