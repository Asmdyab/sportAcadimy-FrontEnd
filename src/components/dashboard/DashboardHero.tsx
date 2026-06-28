import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-academy.jpg";

interface DashboardHeroProps {
  onOperateGroup: () => void;
  onViewGroups: () => void;
}

export function DashboardHero({ onOperateGroup, onViewGroups }: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Sport Academy Facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
      </div>
      <div className="relative p-8 md:p-12 text-primary-foreground">
        <div className="max-w-2xl">
          <h1 className="text-hero mb-4">
            Sport Academy <span className="text-secondary">Dashboard</span>
          </h1>
          <p className="text-xl mb-6 text-primary-foreground/90">
            Manage your academy operations, track performance, and oversee all
            athletic programs in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary-athletic" size="lg" onClick={onOperateGroup}>
              <Play className="h-5 w-5" />
              Operate Group
            </Button>
            <Button variant="hero" size="lg" onClick={onViewGroups}>
              View Groups
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
