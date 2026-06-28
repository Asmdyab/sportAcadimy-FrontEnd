import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();

  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Floating icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-athletic-glow mb-8 animate-float">
          <Trophy className="h-8 w-8 text-primary-foreground" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          Welcome to{" "}
          <span className="text-gradient">AURA</span>
          <br />
          <span className="text-gradient">Sport Academy</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Where passion meets excellence. Empowering athletes of all ages with
          world-class coaching, cutting-edge facilities, and a winning mindset.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="hero"
            size="lg"
            className="text-base px-8 py-6"
            onClick={() => navigate("/register")}
          >
            Join Now
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-base px-8 py-6"
            onClick={scrollToAbout}
          >
            Explore More
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </section>
  );
}
