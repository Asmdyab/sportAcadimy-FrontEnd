import { Target, Heart, Shield, TrendingUp } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We strive for the highest standards in every aspect of athletic development.",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Fueling every training session with genuine love for sports and growth.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "Building character through discipline, respect, and fair play.",
  },
  {
    icon: TrendingUp,
    title: "Progress",
    description: "Continuous improvement through data-driven coaching and personal attention.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            About <span className="text-gradient">AURA</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            AURA Sport Academy is dedicated to nurturing the next generation of
            athletes. We combine expert coaching, modern facilities, and a
            supportive community to help every trainee reach their full potential.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="card-athletic rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
