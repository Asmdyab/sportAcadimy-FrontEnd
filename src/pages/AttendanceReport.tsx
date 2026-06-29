import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { BasePagination } from "@/components/BasePagination";
import { SortableTableHead } from "@/components/ui/SortableTableHead";
import { useSortable } from "@/hooks/useSortable";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ClipboardList, Users, AlertTriangle, TrendingUp, Calendar,
  Trophy, MapPin, UserX,
} from "lucide-react";
import { getAttendanceReport } from "@/services/attendance.services";
import { TraineeAttendanceReportDto } from "@/types/AttendanceDto";
import { useToast } from "@/hooks/use-toast";
import { getAttendanceColor } from "@/lib/attendanceUtils";

type SortKey =
  | "name"
  | "group"
  | "sport"
  | "branch"
  | "attendanceRate"
  | "consecutiveAbsences"
  | "subscriptionEnd"
  | "isActive";

const PAGE_SIZE = 10;

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full max-w-[100px]" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function AttendanceReport() {
  const { toast } = useToast();

  const [data, setData] = useState<TraineeAttendanceReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = PAGE_SIZE;

  const { sort, toggle: handleSort, sortItems } = useSortable<SortKey>();

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchReport = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getAttendanceReport(p, PAGE_SIZE);
      if (res.isSuccess) {
        setData(res.data.items);
        setTotalCount(res.data.totalCount);
      } else {
        toast({ title: "Failed to load attendance report.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to load attendance report.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReport(page);
  }, [page, fetchReport]);

  const sorted = useMemo(
    () =>
      sortItems(data, (item, key) => {
        if (key === "name") return `${item.firstName} ${item.lastName}`;
        if (key === "group") return item.groupName;
        if (key === "sport") return item.sportName;
        if (key === "branch") return item.branchName;
        if (key === "attendanceRate") return item.attendanceRate;
        if (key === "consecutiveAbsences") return item.consecutiveAbsences;
        if (key === "subscriptionEnd") return item.subscriptionEndDate;
        if (key === "isActive") return item.isActive ? 1 : 0;
        return "";
      }),
    [data, sortItems],
  );

  const avgRate = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(data.reduce((sum, d) => sum + d.attendanceRate, 0) / data.length);
  }, [data]);

  const atRiskCount = useMemo(
    () => data.filter((d) => d.consecutiveAbsences >= 3).length,
    [data],
  );

  const SortTH = ({ col, label }: { col: SortKey; label: string }) => (
    <SortableTableHead col={col} label={label} sort={sort} onSort={handleSort} />
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Attendance Report</h1>
          <p className="text-muted-foreground">
            Trainee attendance summary across all groups and sports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-athletic">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Trainees
                </p>
                <p className="text-2xl font-bold mt-1">{totalCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-athletic">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Average Attendance Rate
                </p>
                <p className="text-2xl font-bold mt-1">{avgRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-athletic">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  At-Risk Trainees
                </p>
                <p className="text-2xl font-bold mt-1">{atRiskCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {atRiskCount === 1
                    ? "3+ consecutive absences"
                    : "3+ consecutive absences"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-athletic overflow-hidden">
        {loading ? (
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Absences</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        ) : sorted.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={ClipboardList}
              title="No attendance data available"
              description="Attendance records will appear here once sessions have been conducted."
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortTH col="name" label="Trainee" />
                  <SortTH col="group" label="Group" />
                  <SortTH col="sport" label="Sport" />
                  <SortTH col="branch" label="Branch" />
                  <TableHead className="text-center">Sessions</TableHead>
                  <SortTH col="attendanceRate" label="Rate" />
                  <SortTH col="consecutiveAbsences" label="Consecutive Absences" />
                  <SortTH col="isActive" label="Status" />
                  <TableHead className="text-center">Subscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => {
                  const ac = getAttendanceColor(row.attendanceRate);
                  const fullName = `${row.firstName} ${row.lastName}`;
                  const isAtRisk = row.consecutiveAbsences >= 3;
                  return (
                    <TableRow
                      key={row.enrollmentId}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(row.firstName, row.lastName)}
                          </div>
                          <span className="font-medium text-sm truncate">
                            {fullName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{row.groupName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm">
                          <Trophy className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {row.sportName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {row.branchName}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {row.attendedSessions}
                          <span className="text-muted-foreground/50">
                            /{row.totalSessions}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5 hidden sm:block">
                            <div
                              className={`h-1.5 rounded-full ${ac.bar}`}
                              style={{
                                width: `${Math.min(row.attendanceRate, 100)}%`,
                              }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${ac.text}`}>
                            {row.attendanceRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAtRisk ? (
                          <Badge
                            variant="destructive"
                            className="text-xs whitespace-nowrap"
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            {row.consecutiveAbsences}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {row.consecutiveAbsences}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={row.isActive ? "secondary" : "outline"}
                          className={`text-xs ${
                            row.isActive
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {row.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {formatDate(row.subscriptionEndDate)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="px-4 pb-4">
              <BasePagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
