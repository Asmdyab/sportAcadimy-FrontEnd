import { GraduationCap, Building2, MapPin, Users, LineChart, Calendar } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Coaches",
    description: "Learn from certified professionals with years of competitive and coaching experience.",
  },
  {
    icon: Building2,
    title: "Modern Facilities",
    description: "Train in state-of-the-art venues designed for optimal performance and safety.",
  },
  {
    icon: MapPin,
    title: "Multiple Branches",
    description: "Convenient locations across the city, making it easy to attend sessions.",
  },
  {
    icon: Users,
    title: "Small Groups",
    description: "Personalized attention with low coach-to-trainee ratios for maximum growth.",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description: "Detailed performance analytics and regular assessments to measure improvement.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedules",
    description: "Morning, afternoon, and weekend sessions to fit your busy lifestyle.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose <span className="text-gradient">AURA</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to succeed — all in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex gap-4 p-6 rounded-xl card-athletic"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
