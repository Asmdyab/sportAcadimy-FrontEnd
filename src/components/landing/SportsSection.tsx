import {
  Footprints,
  Volleyball,
  Waves,
  Tent,
  Swords,
  Dumbbell,
} from "lucide-react";

const sports = [
  {
    name: "Football",
    icon: Footprints,
    description:
      "Build teamwork, strategy, and endurance with professional football coaching.",
    color: "from-green-500/20 to-green-600/10",
  },
  {
    name: "Basketball",
    icon: Volleyball,
    description:
      "Develop agility, coordination, and court vision with expert trainers.",
    color: "from-orange-500/20 to-orange-600/10",
  },
  {
    name: "Swimming",
    icon: Waves,
    description:
      "Master technique and build full-body strength in our Olympic-sized pools.",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    name: "Tennis",
    icon: Tent,
    description:
      "Refine your serve, volley, and footwork on premium courts.",
    color: "from-yellow-500/20 to-yellow-600/10",
  },
  {
    name: "Martial Arts",
    icon: Swords,
    description:
      "Learn discipline, self-defense, and mental focus through structured training.",
    color: "from-red-500/20 to-red-600/10",
  },
  {
    name: "Athletics",
    icon: Dumbbell,
    description:
      "Enhance speed, strength, and stamina with tailored athletic programs.",
    color: "from-purple-500/20 to-purple-600/10",
  },
];

export default function SportsSection() {
  return (
    <section id="sports" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Sports</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We offer a wide range of sports programs tailored to every age group
            and skill level.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => {
            const Icon = sport.icon;
            return (
              <div
                key={sport.name}
                className="card-athletic rounded-xl p-6 group cursor-default"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${sport.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{sport.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sport.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
