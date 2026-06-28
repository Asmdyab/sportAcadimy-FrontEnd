import { useEffect, useState, useRef } from "react";
import { Users, UserCheck, Building2, Calendar } from "lucide-react";

interface CounterProps {
  end: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
}

function Counter({ end, suffix = "+", label, icon: Icon }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center p-6">
      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
        <Icon className="h-7 w-7 text-primary-foreground" />
      </div>
      <div className="text-4xl font-bold text-gradient mb-1">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            AURA by the <span className="text-gradient">Numbers</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <Counter end={500} label="Active Trainees" icon={Users} />
          <Counter end={50} label="Expert Coaches" icon={UserCheck} />
          <Counter end={5} label="Branches" icon={Building2} />
          <Counter end={10} suffix="+" label="Years of Excellence" icon={Calendar} />
        </div>
      </div>
    </section>
  );
}
