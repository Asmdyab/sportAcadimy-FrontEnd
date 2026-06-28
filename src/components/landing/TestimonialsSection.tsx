import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote:
      "AURA transformed my son's athletic ability. The coaches are incredibly supportive and professional.",
    name: "Ahmed Al-Rashid",
    role: "Parent",
  },
  {
    quote:
      "The facilities are world-class. I've improved my personal best in just three months of training.",
    name: "Sara Al-Mutairi",
    role: "Swimming Trainee",
  },
  {
    quote:
      "The small group sessions mean every trainee gets individual attention. I feel like I'm growing every day.",
    name: "Faisal Al-Otaibi",
    role: "Football Trainee",
  },
  {
    quote:
      "My daughter loves her tennis classes. The coaches make learning fun while building real skills.",
    name: "Nora Al-Sabah",
    role: "Parent",
  },
  {
    quote:
      "As an adult beginner, I was nervous, but the instructors made me feel welcome. Best decision I've made!",
    name: "Khalid Al-Ansari",
    role: "Martial Arts Trainee",
  },
];

export default function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What Our <span className="text-gradient">Community Says</span>
          </h2>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((t) => (
                <div key={t.name} className="flex-[0_0_100%] sm:flex-[0_0_80%] lg:flex-[0_0_60%] min-w-0 px-4">
                  <div className="card-athletic rounded-xl p-8 text-center">
                    <Quote className="h-8 w-8 text-primary/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-6 leading-relaxed italic">
                      "{t.quote}"
                    </p>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
