import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ClipboardCheck,
  Search,
  X,
  Plus,
  Layers,
  ChevronDown,
} from "lucide-react";
import { BasePagination } from "@/components/BasePagination";
import { useEntitySearch } from "@/hooks/useEntitySearch";
import { StatCardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  listSessions,
  searchSessions,
  getSessionsByDate,
  getSessionGroupsByDate,
  countSessions,
} from "@/services/session.services";
import { getActiveCoachesCount } from "@/services/coaches.service";
import { SessionOccurrenceDto } from "@/types/AttendanceDto";
import { SessionGroupDto } from "@/types/SessionGroup";
import { MarkAttendanceModal } from "@/components/modals/MarkAttendanceModal";
import { OperateGroupModal } from "@/components/modals/OperateGroupModal";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function formatTime(t: string) {
  if (!t) return "";
  if (t.includes("T")) return t.slice(11, 16);
  return t.slice(0, 5);
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function attendanceRate(present: number, late: number, total: number) {
  if (!total) return null;
  return Math.round(((present + late) / total) * 100);
}

type SessionGroup = {
  traineeGroupId: number;
  traineeGroupName: string;
  sportName: string;
  coachName: string;
  branchName: string;
  durationInMinutes: number;
  occurrences: SessionOccurrenceDto[];
  totalEnrolled: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
};

function groupOccurrences(items: SessionOccurrenceDto[]): SessionGroup[] {
  const map = new Map<number, SessionGroup>();
  for (const occ of items) {
    const key = occ.traineeGroupId;
    let group = map.get(key);
    if (!group) {
      group = {
        traineeGroupId: occ.traineeGroupId,
        traineeGroupName: occ.traineeGroupName,
        sportName: occ.sportName,
        coachName: occ.coachName,
        branchName: occ.branchName,
        durationInMinutes: occ.durationInMinutes,
        occurrences: [],
        totalEnrolled: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
      };
      map.set(key, group);
    }
    group.occurrences.push(occ);
    group.totalEnrolled += occ.totalEnrolled;
    group.totalPresent += occ.totalPresent;
    group.totalAbsent += occ.totalAbsent;
    group.totalLate += occ.totalLate;
  }
  return Array.from(map.values()).map((g) => ({
    ...g,
    occurrences: g.occurrences.sort(
      (a, b) => new Date(a.date + "T00:00:00").getTime() - new Date(b.date + "T00:00:00").getTime(),
    ),
  }));
}

function toSessionGroup(g: SessionGroupDto): SessionGroup {
  const totalEnrolled = g.occurrences.reduce((s, o) => s + o.totalEnrolled, 0);
  const totalPresent = g.occurrences.reduce((s, o) => s + o.totalPresent, 0);
  const totalAbsent = g.occurrences.reduce((s, o) => s + o.totalAbsent, 0);
  const totalLate = g.occurrences.reduce((s, o) => s + o.totalLate, 0);
  const sorted = [...g.occurrences].sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
  );
  return {
    traineeGroupId: g.traineeGroupId,
    traineeGroupName: g.traineeGroupName,
    sportName: g.sportName,
    coachName: g.coachName,
    branchName: g.branchName,
    durationInMinutes: g.durationInMinutes,
    totalEnrolled,
    totalPresent,
    totalAbsent,
    totalLate,
    occurrences: sorted.map((o) => ({
      id: o.id,
      sportName: g.sportName,
      coachName: g.coachName,
      branchName: g.branchName,
      traineeGroupId: g.traineeGroupId,
      traineeGroupName: g.traineeGroupName,
      startTime: o.startDateTime,
      durationInMinutes: g.durationInMinutes,
      traineesCount: o.traineesCount,
      totalEnrolled: o.totalEnrolled,
      totalPresent: o.totalPresent,
      totalAbsent: o.totalAbsent,
      totalLate: o.totalLate,
      date: o.startDateTime.slice(0, 10),
    })),
  };
}

const STATS_META = [
  { title: "Total Sessions", icon: CalendarIcon },
  { title: "Today's Groups", icon: Layers },
  { title: "Active Coaches", icon: Users },
  { title: "Avg. Duration", icon: Clock },
] as const;

function GroupSkeleton() {
  return (
    <Card className="card-athletic">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-2 flex-1 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionGroupCard({
  group,
  onMark,
}: {
  group: SessionGroup;
  onMark: (session: SessionOccurrenceDto) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const rate = attendanceRate(group.totalPresent, group.totalLate, group.totalEnrolled);
  const hasAttendance = group.totalPresent + group.totalLate + group.totalAbsent > 0;
  const totalTrainees = group.totalEnrolled || group.occurrences[0]?.traineesCount || 0;

  const rateColor =
    rate === null ? "bg-muted text-muted-foreground" :
    rate >= 80 ? "bg-success/10 text-success border-success/20" :
    rate >= 60 ? "bg-warning/10 text-warning border-warning/20" :
    "bg-destructive/10 text-destructive border-destructive/20";

  const barColor =
    rate === null ? "bg-muted" :
    rate >= 80 ? "bg-success" :
    rate >= 60 ? "bg-warning" :
    "bg-destructive";

  const formatOccDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });

  return (
    <Card className="card-athletic overflow-hidden">
      <CardContent className="p-0">
        {/* Summary header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base truncate">{group.traineeGroupName}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {group.sportName} &middot; Coach: {group.coachName} &middot; Branch: {group.branchName}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {group.occurrences.length} occ
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(group.durationInMinutes)}
            </span>
          </div>

          {/* Attendance bar */}
          {hasAttendance && rate !== null ? (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${rateColor.split(" ")[1]}`}>{rate}% attendance</span>
                <span className="text-muted-foreground">
                  {group.totalPresent + group.totalLate}/{group.totalEnrolled}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-success transition-all"
                  style={{ width: `${(group.totalPresent / group.totalEnrolled) * 100}%` }}
                />
                <div
                  className="h-full bg-warning transition-all"
                  style={{ width: `${(group.totalLate / group.totalEnrolled) * 100}%` }}
                />
                <div
                  className="h-full bg-destructive transition-all"
                  style={{ width: `${(group.totalAbsent / group.totalEnrolled) * 100}%` }}
                />
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="text-success font-medium">{group.totalPresent} present</span>
                <span className="text-warning font-medium">{group.totalLate} late</span>
                <span className="text-destructive font-medium">{group.totalAbsent} absent</span>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-muted-foreground">
              {totalTrainees > 0 ? `${totalTrainees} trainees enrolled` : "No enrollments"}
            </div>
          )}
        </div>

        {/* Expand / Collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-t border-border"
        >
          <span>
            {expanded ? "Hide" : "Show"} {group.occurrences.length} occurrence{group.occurrences.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        {/* Expanded occurrences list */}
        {expanded && (
          <div className="border-t border-border divide-y divide-border/50">
            {group.occurrences.map((occ) => {
              const occRate = attendanceRate(occ.totalPresent, occ.totalLate, occ.totalEnrolled);
              const occHasAttendance = occ.totalPresent + occ.totalLate + occ.totalAbsent > 0;
              return (
                <div key={occ.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="text-muted-foreground shrink-0 w-28">
                      {formatOccDate(occ.date)}
                    </span>
                    <span className="text-muted-foreground shrink-0 w-12">
                      {formatTime(occ.startTime)}
                    </span>
                    {occHasAttendance && occRate !== null ? (
                      <Badge className={`${rateColor} text-xs shrink-0`}>{occRate}%</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">&mdash;</span>
                    )}
                    {occHasAttendance && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {occ.totalPresent + occ.totalLate}/{occ.totalEnrolled}
                      </span>
                    )}
                  </div>
                  {occ.traineesCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMark(occ)}
                      className="shrink-0"
                    >
                      <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                      {occHasAttendance ? "Update" : "Mark"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Sessions() {
  const [searchParams] = useSearchParams();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [dateFilter, setDateFilter] = useState<string>(() => {
    const param = searchParams.get("date");
    if (!param) return "";
    if (param === "today") return todayIso();
    return param;
  });

  const [filterGroupId, setFilterGroupId] = useState<number | null>(() => {
    const param = searchParams.get("traineeGroupId");
    return param ? Number(param) : null;
  });
  const [filterGroupName, setFilterGroupName] = useState<string | null>(() => {
    return searchParams.get("traineeGroupName") || null;
  });

  const [markOpen, setMarkOpen] = useState(false);
  const [markSession, setMarkSession] = useState<SessionOccurrenceDto | null>(null);

  const [dateGroups, setDateGroups] = useState<SessionGroupDto[]>([]);
  const [dateLoading, setDateLoading] = useState(false);
  const [dateGroupPage, setDateGroupPage] = useState(1);
  const [dateGroupTotalPages, setDateGroupTotalPages] = useState(1);
  const [dateGroupTotalCount, setDateGroupTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const isDateMode = Boolean(dateFilter);

  const loadByDate = useCallback(async (date: string, page?: number, groupId?: number) => {
    setDateLoading(true);
    try {
      const gid = groupId !== undefined ? groupId : filterGroupId;
      const p = page ?? dateGroupPage;
      const res = await getSessionGroupsByDate(date, p, PAGE_SIZE, gid ?? undefined);
      if (res.isSuccess) {
        setDateGroups(res.data.items);
        setDateGroupTotalCount(res.data.totalCount);
        setDateGroupTotalPages(Math.max(1, Math.ceil(res.data.totalCount / PAGE_SIZE)));
      } else { setDateGroups([]); }
    } catch { setDateGroups([]); }
    finally { setDateLoading(false); }
  }, [filterGroupId, dateGroupPage]);

  useEffect(() => {
    if (dateFilter) loadByDate(dateFilter, 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const iso = format(date, "yyyy-MM-dd");
    setDateFilter(iso);
    setCalendarOpen(false);
    loadByDate(iso);
  };

  const clearDateFilter = () => { setDateFilter(""); setDateGroups([]); setFilterGroupId(null); setFilterGroupName(null); setDateGroupPage(1); };

  const listFn = useCallback(
    (page: number, pageSize: number) => listSessions(page, pageSize),
    [],
  );
  const searchFn = useCallback(
    (term: string, page: number, pageSize: number) => searchSessions(term, page, pageSize),
    [],
  );

  const {
    items: searchResults,
    loading: searchLoading,
    term,
    setTerm,
    page: searchPage,
    setPage: setSearchPage,
    totalPages: searchTotalPages,
    refresh,
  } = useEntitySearch<SessionOccurrenceDto>({ listFn, searchFn, pageSize: PAGE_SIZE });

  const loading = isDateMode ? dateLoading : searchLoading;
  const page = isDateMode ? dateGroupPage : searchPage;
  const totalPages = isDateMode ? dateGroupTotalPages : searchTotalPages;
  const totalCount = isDateMode ? dateGroupTotalCount : searchResults.length;

  const handlePageChange = (p: number) => {
    if (isDateMode) { setDateGroupPage(p); loadByDate(dateFilter, p); }
    else setSearchPage(p);
  };

  const groups = useMemo(() => {
    if (isDateMode) return (dateGroups as SessionGroupDto[]).map(toSessionGroup);
    return groupOccurrences(searchResults);
  }, [isDateMode, dateGroups, searchResults]);

  // Stats
  const [totalSessions, setTotalSessions] = useState<number | null>(null);
  const [todayGroupCount, setTodayGroupCount] = useState<number | null>(null);
  const [activeCoaches, setActiveCoaches] = useState<number | null>(null);
  const [avgDuration, setAvgDuration] = useState<number | null>(null);

  const loadStats = useCallback(async () => {
    const [total, todayRes, coachesRes] = await Promise.allSettled([
      countSessions(),
      getSessionGroupsByDate(todayIso(), 1, 1),
      getActiveCoachesCount(),
    ]);
    if (total.status === "fulfilled" && total.value.isSuccess)
      setTotalSessions(total.value.data);
    if (todayRes.status === "fulfilled" && todayRes.value.isSuccess)
      setTodayGroupCount(todayRes.value.data.totalCount);
    if (coachesRes.status === "fulfilled" && coachesRes.value.isSuccess)
      setActiveCoaches(coachesRes.value.data);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (groups.length === 0) return;
    const avg = Math.round(
      groups.reduce((sum, g) => sum + g.durationInMinutes, 0) / groups.length,
    );
    setAvgDuration(avg);
  }, [groups]);

  const handleGenerateSuccess = useCallback((groupId?: number, groupName?: string) => {
    if (groupId) {
      setFilterGroupId(groupId);
      setFilterGroupName(groupName ?? null);
      setDateFilter(todayIso());
      setDateGroupPage(1);
      loadByDate(todayIso(), 1, groupId);
    }
    refresh();
    loadStats();
  }, [refresh, loadStats, loadByDate]);

  const statsValues = [
    totalSessions != null ? String(totalSessions) : "—",
    todayGroupCount != null ? String(todayGroupCount) : "—",
    activeCoaches != null ? String(activeCoaches) : "—",
    avgDuration != null ? `${avgDuration} min` : "—",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Sessions Management</h1>
          <p className="text-muted-foreground">Manage training sessions, view attendance, and operate groups</p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setModalOpen(true)}>
          <Plus className="h-5 w-5" />
          Operate Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_META.map((meta, i) =>
          statsValues[i] === "—" ? (
            <StatCardSkeleton key={i} />
          ) : (
            <Card key={i} className="card-athletic">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{meta.title}</p>
                    <p className="text-2xl font-bold mt-1">{statsValues[i]}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <meta.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Filters */}
      <Card className="card-athletic">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={isDateMode ? "Clear date filter to search…" : "Search by sport, coach, or branch…"}
                value={isDateMode ? "" : term}
                onChange={(e) => !isDateMode && setTerm(e.target.value)}
                disabled={isDateMode}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 min-w-[160px] justify-start font-normal">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {dateFilter ? format(new Date(dateFilter + "T00:00:00"), "MMM d, yyyy") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateFilter ? new Date(dateFilter + "T00:00:00") : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {(isDateMode || term) && (
                <Button variant="ghost" size="icon" onClick={isDateMode ? clearDateFilter : () => setTerm("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isDateMode && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(dateFilter + "T00:00:00"), "EEEE, MMM d")}
                {!loading && (
                  <span className="text-xs opacity-70">&middot; {totalCount} session{totalCount !== 1 ? "s" : ""}</span>
                )}
              </div>
            )}
            {filterGroupId && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-info/10 text-info text-sm font-medium whitespace-nowrap">
                <Layers className="h-4 w-4" />
                {filterGroupName ?? `Group #${filterGroupId}`}
                <button
                  onClick={() => { setFilterGroupId(null); setFilterGroupName(null); if (dateFilter) loadByDate(dateFilter); }}
                  className="ml-1 hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grouped cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <GroupSkeleton key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        term.length >= 2 ? (
          <EmptyState
            icon={Layers}
            title={`No sessions match "${term}"`}
            description="Try a different search term or clear the filter."
            actions={[
              { label: "Clear Search", onClick: () => setTerm(""), variant: "outline" },
            ]}
          />
        ) : isDateMode ? (
          <EmptyState
            icon={CalendarIcon}
            title="No sessions scheduled for this date"
            description="No sessions were found for the selected date. Generate sessions for a group or try a different date."
            actions={[
              { label: "Operate Group", onClick: () => setModalOpen(true) },
              { label: "Clear Date Filter", onClick: clearDateFilter, variant: "outline" },
            ]}
          />
        ) : (
          <EmptyState
            icon={Layers}
            title="No sessions found"
            description="Operate a trainee group to generate sessions from its weekly schedule."
            actions={[
              { label: "Operate Group", onClick: () => setModalOpen(true) },
            ]}
          />
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groups.map((group) => (
            <SessionGroupCard
              key={group.traineeGroupId}
              group={group}
              onMark={(s) => { setMarkSession(s); setMarkOpen(true); }}
            />
          ))}
        </div>
      )}

      <BasePagination
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={() => {}}
      />

      <OperateGroupModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleGenerateSuccess}
      />
      <MarkAttendanceModal
        open={markOpen}
        onOpenChange={setMarkOpen}
        onSuccess={() => { if (isDateMode) loadByDate(dateFilter); else refresh(); }}
        sessionOccurrenceId={markSession?.id}
        sessionLabel={
          markSession
            ? `${markSession.sportName} &mdash; ${format(new Date(markSession.date + "T00:00:00"), "MMM d")} ${formatTime(markSession.startTime)}`
            : undefined
        }
      />
    </div>
  );
}
