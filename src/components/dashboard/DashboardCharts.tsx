import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartSkeleton } from "@/components/ui/CardSkeleton";
import { Activity, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardChartsProps {
  attendanceData: { month: string; attendance: number }[];
  attendanceLoading: boolean;
  enrollmentData: { sport: string; enrolled: number }[];
  enrollmentLoading: boolean;
  rangeLabel: string;
  monthOffset: number;
  onOffsetChange: (delta: number) => void;
}

export function DashboardCharts({
  attendanceData,
  attendanceLoading,
  enrollmentData,
  enrollmentLoading,
  rangeLabel,
  monthOffset,
  onOffsetChange,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attendance Trend */}
      <Card className="card-athletic">
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Monthly Attendance Trends
            </CardTitle>
            <div className="flex items-center gap-1 text-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onOffsetChange(-1)}
                disabled={attendanceLoading}
                title="Previous month window"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[110px] text-center text-xs text-muted-foreground font-medium tabular-nums">
                {rangeLabel}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onOffsetChange(1)}
                disabled={attendanceLoading || monthOffset >= 0}
                title="Next month window"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {attendanceLoading ? (
            <ChartSkeleton type="line" />
          ) : (
            <ChartContainer
              config={{ attendance: { label: "Attendance %", color: "hsl(var(--primary))" } }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Sport Enrollments */}
      <Card className="card-athletic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Sport Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollmentLoading ? (
            <ChartSkeleton type="bar" />
          ) : (
            <ChartContainer
              config={{ enrolled: { label: "Enrolled", color: "hsl(var(--secondary))" } }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <XAxis
                    dataKey="sport"
                    tickFormatter={(v) => (v.length > 10 ? v.substring(0, 8) + ".." : v)}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="enrolled" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
