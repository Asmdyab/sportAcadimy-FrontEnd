import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { mapAttendanceToSessions, SessionVm } from "@/lib/mappers";
import { getAttendanceByDate } from "@/services/attendance.services";
import { getNotifications, NotificationDto } from "@/services/notifications.service";
import {
  getDashboardStats,
  getDashboardCharts,
  DashboardStatsDto,
  DashboardChartsDto,
} from "@/services/dashboard.service";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardSessionList } from "@/components/dashboard/DashboardSessionList";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Activity, AlertCircle } from "lucide-react";
import { OperateGroupModal } from "@/components/modals/OperateGroupModal";
import { TraineeFormModal } from "@/components/modals/TraineeFormModal";
import { EnrollmentFormModal } from "@/components/modals/EnrollmentFormModal";
import { CoachFormModal } from "@/components/modals/CoachFormModal";

const MONTH_COUNT = 5;

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function getMonthWindow(
  count: number,
  endOffset: number,
): { value: number; year: number; label: string }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + endOffset - (count - 1 - i), 1);
    return { value: d.getMonth() + 1, year: d.getFullYear(), label: d.toLocaleString("en", { month: "short" }) };
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [operateOpen,    setOperateOpen]    = useState(false);
  const [traineeOpen,    setTraineeOpen]    = useState(false);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [coachOpen,      setCoachOpen]      = useState(false);

  const [loading,        setLoading]        = useState(true);
  const [stats,          setStats]          = useState<DashboardStatsDto | null>(null);

  const [sessions, setSessions] = useState<SessionVm[]>([]);

  const [activityItems,   setActivityItems]   = useState<NotificationDto[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [charts,           setCharts]           = useState<DashboardChartsDto | null>(null);
  const [chartsLoading,    setChartsLoading]    = useState(true);
  const [monthOffset,      setMonthOffset]      = useState(0);

  const [statsError,      setStatsError]      = useState<string | null>(null);
  const [chartsError,     setChartsError]     = useState<string | null>(null);

  const showError = (title: string, description: string) => {
    toast({ variant: "destructive", title, description });
  };

  const loadCharts = useCallback(async (offset: number) => {
    setChartsLoading(true);
    setChartsError(null);
    try {
      const res = await getDashboardCharts(MONTH_COUNT, offset);
      if (res.isSuccess) setCharts(res.data);
      else setChartsError(res.message || "Failed to load chart data");
    } catch {
      setChartsError("Network error while loading chart data");
    } finally {
      setChartsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setStatsError(null);
      try {
        const [statsRes, attendanceRes] = await Promise.allSettled([
          getDashboardStats(),
          getAttendanceByDate(todayIso()),
        ]);

        if (statsRes.status === "fulfilled") {
          if (statsRes.value.isSuccess) setStats(statsRes.value.data);
          else setStatsError(statsRes.value.message || "Failed to load stats");
        } else {
          setStatsError("Network error while loading dashboard stats");
        }

        if (attendanceRes.status === "fulfilled" && attendanceRes.value.isSuccess)
          setSessions(mapAttendanceToSessions(attendanceRes.value.data));
      } finally {
        setLoading(false);
      }
    };

    load();
    loadCharts(0);

    getNotifications(1, 10)
      .then((res) => { if (res.isSuccess) setActivityItems(res.data.items); })
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOffsetChange = (delta: number) => {
    const next = monthOffset + delta;
    setMonthOffset(next);
    loadCharts(next);
  };

  const months = getMonthWindow(MONTH_COUNT, monthOffset);
  const rangeLabel = `${months[0].label} – ${months[MONTH_COUNT - 1].label}`;
  const today = todayIso();

  return (
    <div className="space-y-8">
      <DashboardHero
        onOperateGroup={() => setOperateOpen(true)}
        onViewGroups={() => navigate("/trainee-groups")}
      />

      <DashboardQuickActions
        onAddTrainee={() => setTraineeOpen(true)}
        onNewEnrollment={() => setEnrollmentOpen(true)}
        onMarkAttendance={() => navigate("/attendance")}
        onGenerateSessions={() => setOperateOpen(true)}
        onAddCoach={() => setCoachOpen(true)}
      />

      {statsError && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{statsError}</span>
        </div>
      )}

      {chartsError && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{chartsError}</span>
        </div>
      )}

      <DashboardStats
        loading={loading}
        traineesCount={stats?.traineesCount ?? 0}
        activeCoaches={stats?.activeCoaches ?? 0}
        todayCount={stats?.todaySessionsCount ?? 0}
        attendanceRate={stats?.attendanceRate ?? 0}
        onNavigate={navigate}
      />

      <DashboardCharts
        attendanceData={charts?.monthlyAttendance.map((m) => ({ month: m.month, attendance: m.rate })) ?? []}
        attendanceLoading={chartsLoading}
        enrollmentData={charts?.enrollmentsBySport.map((s) => ({ sport: s.sportName, enrolled: s.count })) ?? []}
        enrollmentLoading={chartsLoading}
        rangeLabel={rangeLabel}
        monthOffset={monthOffset}
        onOffsetChange={handleOffsetChange}
      />

      <DashboardSessionList
        loading={loading}
        sessions={sessions}
        todayIso={today}
        onViewAll={() => navigate(`/sessions?date=${today}`)}
        onSessionClick={() => navigate(`/sessions?date=${today}`)}
      />

      <Card className="card-athletic">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/notifications")}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed items={activityItems} loading={activityLoading} limit={10} />
        </CardContent>
      </Card>

      <OperateGroupModal
        open={operateOpen}
        onOpenChange={setOperateOpen}
        onSuccess={() => setOperateOpen(false)}
      />
      <TraineeFormModal
        open={traineeOpen}
        onOpenChange={setTraineeOpen}
        onSuccess={() => setTraineeOpen(false)}
      />
      <EnrollmentFormModal
        open={enrollmentOpen}
        onOpenChange={setEnrollmentOpen}
        onSuccess={() => setEnrollmentOpen(false)}
      />
      <CoachFormModal
        open={coachOpen}
        onOpenChange={setCoachOpen}
        onSuccess={() => setCoachOpen(false)}
      />
    </div>
  );
}
