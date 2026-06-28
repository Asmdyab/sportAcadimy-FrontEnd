import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCardSkeleton } from "@/components/ui/CardSkeleton";
import { GraduationCap, UserCheck, Calendar, Activity, TrendingUp } from "lucide-react";

const STATS_META = [
  { title: "Today's Trainees", icon: GraduationCap, change: "+12%", href: "/trainees?date=today" },
  { title: "Active Coaches",   icon: UserCheck,     change: "+5%",  href: "/coaches" },
  { title: "Today's Sessions", icon: Calendar,      change: "+8%",  href: "/sessions?date=today" },
  { title: "Attendance Rate",  icon: Activity,      change: "+2%",  href: "/attendance?date=today" },
] as const;

interface DashboardStatsProps {
  loading: boolean;
  traineesCount: number;
  activeCoaches: number;
  todayCount: number;
  attendanceRate: number;
  onNavigate: (href: string) => void;
}

export function DashboardStats({
  loading,
  traineesCount,
  activeCoaches,
  todayCount,
  attendanceRate,
  onNavigate,
}: DashboardStatsProps) {
  const values = [
    traineesCount.toString(),
    activeCoaches.toString(),
    todayCount.toString(),
    `${attendanceRate}%`,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        : STATS_META.map((stat, index) => (
            <Card
              key={index}
              className="card-athletic cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 group"
              onClick={() => onNavigate(stat.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{values[index]}</p>
                    <div className="flex items-center mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-success/10 text-success hover:bg-success/20"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  );
}
