import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl bg-gradient-hero p-10 sm:p-16 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join AURA Sport Academy today and unlock your full athletic potential.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg text-base px-8 py-6"
                onClick={() => navigate("/register")}
              >
                Join AURA Today
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
