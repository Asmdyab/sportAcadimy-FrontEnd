import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { formatRelativeDate, formatSmartDate } from "@/lib/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceSessionSkeleton, StatCardSkeleton } from "@/components/ui/CardSkeleton";
import { RosterRowSkeleton } from "@/components/ui/TableRowSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ClipboardCheck,
  Users,
  Search,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  MapPin,
  Trophy,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import {
  getAttendanceByDate,
  getAverageAttendance,
} from "@/services/attendance.services";
import {
  AttendanceByDateRecordDto,
  SessionOccurrenceDto,
  AttendanceRecordDto,
  AttendanceStatus,
} from "@/types/AttendanceDto";
import { MarkAttendanceModal } from "@/components/modals/MarkAttendanceModal";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ViewToggle, ViewMode } from "@/components/ui/ViewToggle";
import { SortableTableHead } from "@/components/ui/SortableTableHead";
import { useSortable } from "@/hooks/useSortable";
import { RowActions } from "@/components/ui/RowActions";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function formatTime(t: string) {
  return t?.slice(0, 5) ?? "";
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function attendanceRate(present: number, total: number) {
  if (!total) return 0;
  return Math.round((present / total) * 100);
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  Present: {
    label: "Present",
    color: "bg-success/10 text-success border-success/20",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  Absent: {
    label: "Absent",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  Excused: {
    label: "Excused",
    color: "bg-muted text-muted-foreground",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

// (SessionCardSkeleton and RosterSkeleton are now imported from CardSkeleton/TableRowSkeleton)

// ─── Attendance roster row ────────────────────────────────────────────────────
function AttendeeRow({ record }: { record: AttendanceRecordDto }) {
  const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.Absent;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
            {getInitials(record.traineeName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{record.traineeName}</p>
          {record.checkInTime && (
            <p className="text-xs text-muted-foreground">
              Check-in: {formatTime(record.checkInTime)}
            </p>
          )}
        </div>
      </div>
      <Badge className={`${cfg.color} flex items-center gap-1 text-xs`}>
        {cfg.icon}
        {cfg.label}
      </Badge>
    </div>
  );
}

// ─── Roster skeleton ─────────────────────────────────────────────────────────
// RosterSkeleton → now imported as RosterRowSkeleton from TableRowSkeleton

// ─── Session Attendance Card ──────────────────────────────────────────────────
function SessionAttendanceCard({
  session,
  searchTerm,
  records,
  onMarkAttendance,
}: {
  session: SessionOccurrenceDto;
  searchTerm: string;
  records: AttendanceRecordDto[];
  onMarkAttendance?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const rosterPresent = records.filter((r) => r.status === "Present").length;
  const rosterAbsent = records.filter((r) => r.status === "Absent").length;
  const rate = expanded ? attendanceRate(rosterPresent, records.length) : 0;

  const filteredRoster = searchTerm.trim().length >= 2
    ? records.filter((r) =>
        r.traineeName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : records;

  return (
    <Card className="card-athletic overflow-hidden">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Session info */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary shrink-0" />
              {session.sportName}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {session.coachName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(session.startTime)} ({formatDuration(session.durationInMinutes)})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {session.branchName}
              </span>
            </div>
          </div>

          {/* Summary counters */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="px-3 py-2 rounded-lg bg-success/10">
                <p className="text-lg font-bold text-success">{expanded ? rosterPresent : "—"}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="px-3 py-2 rounded-lg bg-destructive/10">
                <p className="text-lg font-bold text-destructive">{expanded ? rosterAbsent : "—"}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="px-3 py-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{session.traineesCount}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>

            {/* Rate + actions */}
            <div className="flex flex-col items-end gap-2">
              <Badge
                className={
                  rate >= 80
                    ? "bg-success/10 text-success border-success/20"
                    : rate >= 60
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }
              >
                {records.length > 0 ? `${rate}%` : "—"}
              </Badge>
              <Button
                variant="default"
                size="sm"
                onClick={() => onMarkAttendance?.()}
                className="flex items-center gap-1.5 text-xs"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Mark
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggle}
                className="flex items-center gap-1.5 text-xs"
              >
                {expanded ? (
                  <><ChevronUp className="h-3.5 w-3.5" /> Hide</>
                ) : (
                  <><ChevronDown className="h-3.5 w-3.5" /> Roster</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Expandable roster */}
      {expanded && (
        <CardContent className="pt-0">
          {filteredRoster.length === 0 ? (
            <div className="pt-4 border-t border-border text-center py-8 text-muted-foreground text-sm">
              {records.length === 0
                ? "No attendance records found for this session."
                : "No trainees match the search term."}
            </div>
          ) : (
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                Attendance Roster — {filteredRoster.length} trainees
              </p>
              {filteredRoster.map((r) => (
                <AttendeeRow key={r.id} record={r} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// StatSkeleton → now imported as StatCardSkeleton from CardSkeleton

// ─── Main Page ────────────────────────────────────────────────────────────────
const Attendance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Seed date from URL query param (e.g. ?date=today from dashboard)
  const initialDate = (() => {
    const p = searchParams.get("date");
    if (!p) return todayIso();
    return p === "today" ? todayIso() : p;
  })();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [markOpen, setMarkOpen] = useState(false);
  const [markSession, setMarkSession] = useState<SessionOccurrenceDto | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const { sort, toggle: toggleSort, sortItems } = useSortable<"sportName" | "coachName" | "branchName" | "startTime" | "durationInMinutes" | "traineesCount">();

  // Attendance records for selected date (direct from Attendances table)
  const [records, setRecords] = useState<AttendanceByDateRecordDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Stat: overall attendance rate
  const [avgRate, setAvgRate] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Fetch attendance records for selected date ───────────────────────────
  const loadRecords = useCallback(async (date: string) => {
    setLoading(true);
    setRecords([]);
    try {
      const res = await getAttendanceByDate(date);
      if (res.isSuccess) setRecords(res.data);
      else toast({ title: "Failed to load attendance records.", variant: "destructive" });
    } catch {
      toast({ title: "Failed to load attendance records.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRecords(selectedDate);
  }, [selectedDate, loadRecords]);

  // ── Fetch overall stats ───────────────────────────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const res = await getAverageAttendance();
        if (res.isSuccess) setAvgRate(res.data);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // ── Group flat attendance records by session occurrence ──────────────────
  const groupedSessions = useMemo(() => {
    const map = new Map<number, SessionOccurrenceDto & { roster: AttendanceRecordDto[] }>();

    for (const r of records) {
      let session = map.get(r.sessionOccurrenceId);
      if (!session) {
        session = {
          id: r.sessionOccurrenceId,
          sportName: r.sportName,
          coachName: r.coachName,
          branchName: r.branchName,
          startTime: r.startTime,
          durationInMinutes: r.durationInMinutes,
          traineesCount: 0,
          totalEnrolled: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          date: r.attendanceDate,
          roster: [],
        };
        map.set(r.sessionOccurrenceId, session);
      }
      session.roster.push({
        id: r.id,
        traineeId: r.traineeId,
        traineeName: r.traineeName,
        checkInTime: r.checkInTime,
        status: r.status,
      });
      if (r.status === "Present") session.totalPresent++;
      if (r.status === "Absent") session.totalAbsent++;
    }

    for (const session of map.values()) {
      session.traineesCount = session.roster.length;
      session.totalEnrolled = session.roster.length;
    }

    return Array.from(map.values());
  }, [records]);

  const todayTotal = groupedSessions.length;
  const todayEnrolled = records.length;

type AttendanceSortKey = "sportName" | "coachName" | "branchName" | "startTime" | "durationInMinutes" | "traineesCount";

  // Filter sessions by search term (session-level: sport, coach, branch)
  const filteredSessions =
    searchTerm.trim().length >= 2
      ? groupedSessions.filter(
          (s) =>
            s.sportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.branchName.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : groupedSessions;

  const visibleSessions = sortItems(filteredSessions, (s, key) => {
    const v = (s as unknown as Record<string, unknown>)[key] ?? "";
    return typeof v === "number" ? v : String(v);
  });

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Attendance Management</h1>
          <p className="text-muted-foreground">Track and review session attendance by date</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadRecords(selectedDate)}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsLoading || loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card className="card-athletic">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayTotal}</div>
                <p className="text-xs text-muted-foreground">
                  for{" "}
                  <span title={new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}>
                    {formatRelativeDate(selectedDate + "T00:00:00")}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="card-athletic">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {avgRate !== null ? `${avgRate}%` : "—"}
                </div>
                <p className="text-xs text-muted-foreground">all-time average</p>
              </CardContent>
            </Card>

            <Card className="card-athletic">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayEnrolled}</div>
                <p className="text-xs text-muted-foreground">
                  across {todayTotal} session{todayTotal !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card className="card-athletic">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <XCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayTotal}</div>
                <p className="text-xs text-muted-foreground">
                  on selected date
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ── Date Picker & Search ────────────────────────────────────────── */}
      <Card className="card-athletic">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Shadcn Popover/Calendar date picker */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-auto min-w-[160px] justify-start font-normal"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {selectedDate ? (
                    <>
                      <span>{formatRelativeDate(selectedDate + "T00:00:00")}</span>
                      <span className="text-muted-foreground/60 text-xs hidden sm:inline">
                        — {format(new Date(selectedDate + "T00:00:00"), "MMM d, yyyy")}
                      </span>
                    </>
                  ) : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate ? new Date(selectedDate + "T00:00:00") : undefined}
                  onSelect={(d) => {
                    if (d) {
                      setSelectedDate(format(d, "yyyy-MM-dd"));
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by sport, coach, or branch…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Session count badge */}
            {!loading && groupedSessions.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
                <Users className="h-4 w-4" />
                {groupedSessions.length} session{groupedSessions.length !== 1 ? "s" : ""}
              </div>
            )}

            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardContent>
      </Card>

      {/* ── Session Cards / Table ────────────────────────────────────────── */}
      {loading ? (
        view === "grid" ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <AttendanceSessionSkeleton key={i} />)}
          </div>
        ) : (
          <Card className="card-athletic">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Sport", "Coach", "Branch", "Time", "Duration", "Present", "Late", "Absent", "Rate", ""].map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : visibleSessions.length === 0 ? (
        searchTerm.trim().length >= 2 ? (
          <EmptyState
            icon={Search}
            title={`No sessions match "${searchTerm}"`}
            description="Try a different search term or clear the search."
            actions={[
              { label: "Clear Search", onClick: () => setSearchTerm(""), variant: "outline" },
            ]}
          />
        ) : (
          <EmptyState
            icon={ClipboardCheck}
            title={`No attendance on ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`}
            description="No attendance records were found for this date."
            actions={[
              { label: "Go to Today", onClick: () => setSelectedDate(todayIso()), variant: "outline" },
            ]}
          />
        )
      ) : view === "grid" ? (
        <div className="space-y-4">
          {visibleSessions.map((session) => {
            const roster = records.filter((r) => r.sessionOccurrenceId === session.id);
            return (
              <SessionAttendanceCard
                key={session.id}
                session={session}
                searchTerm={searchTerm}
                records={roster}
                onMarkAttendance={() => { setMarkSession(session); setMarkOpen(true); }}
              />
            );
          })}
        </div>
      ) : (
        <Card className="card-athletic">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {(
                    [
                      { label: "Sport", key: "sportName" },
                      { label: "Coach", key: "coachName" },
                      { label: "Branch", key: "branchName" },
                      { label: "Time", key: "startTime" },
                      { label: "Duration", key: "durationInMinutes" },
                      { label: "Enrolled", key: "traineesCount" },
                    ] as { label: string; key: AttendanceSortKey }[]
                  ).map(({ label, key }) => (
                    <SortableTableHead key={key} col={key} label={label} sort={sort} onSort={toggleSort} />
                  ))}
                  <TableHead>Absent</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                  {visibleSessions.map((session) => {
                  const enr = session.traineesCount;
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.sportName}</TableCell>
                      <TableCell>{session.coachName}</TableCell>
                      <TableCell>{session.branchName}</TableCell>
                      <TableCell>{formatTime(session.startTime)}</TableCell>
                      <TableCell>{formatDuration(session.durationInMinutes)}</TableCell>
                      <TableCell><span className="text-success font-medium">{enr}</span></TableCell>
                      <TableCell><span className="text-muted-foreground">—</span></TableCell>
                      <TableCell><span className="text-muted-foreground">—</span></TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-xs">—</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => { setMarkSession(session); setMarkOpen(true); }}>
                          <ClipboardList className="h-3.5 w-3.5 mr-1" />Mark
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Mark Attendance Modal ───────────────────────────────────────── */}
      <MarkAttendanceModal
        open={markOpen}
        onOpenChange={setMarkOpen}
        onSuccess={() => loadRecords(selectedDate)}
        sessionOccurrenceId={markSession?.id}
        sessionLabel={
          markSession
            ? `${markSession.sportName} — ${formatTime(markSession.startTime)}`
            : undefined
        }
      />
    </div>
  );
};

export default Attendance;
