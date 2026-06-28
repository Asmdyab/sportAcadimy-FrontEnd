import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import SportsSection from "@/components/landing/SportsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import BranchesSection from "@/components/landing/BranchesSection";
import StatsSection from "@/components/landing/StatsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <AboutSection />
      <SportsSection />
      <FeaturesSection />
      <BranchesSection />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
};

export default Index;
