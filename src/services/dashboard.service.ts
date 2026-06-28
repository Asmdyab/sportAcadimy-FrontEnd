import { apiFetch } from "@/lib/api";
import { ApiResult } from "@/types/api";
import { isDevSession, devMock } from "@/auth/dev-login";

export interface DashboardStatsDto {
  traineesCount: number;
  activeCoaches: number;
  todaySessionsCount: number;
  attendanceRate: number;
}

export interface MonthlyAttendanceDto {
  month: string;
  rate: number;
}

export interface SportEnrollmentDto {
  sportName: string;
  count: number;
}

export interface DashboardChartsDto {
  monthlyAttendance: MonthlyAttendanceDto[];
  enrollmentsBySport: SportEnrollmentDto[];
}

export const getDashboardStats = async (): Promise<ApiResult<DashboardStatsDto>> => {
  if (isDevSession())
    return devMock<DashboardStatsDto>({
      traineesCount: 0,
      activeCoaches: 0,
      todaySessionsCount: 0,
      attendanceRate: 0,
    });
  return await apiFetch<ApiResult<DashboardStatsDto>>("/api/dashboard/stats");
};

export const getDashboardCharts = async (
  months = 5,
  offset = 0,
): Promise<ApiResult<DashboardChartsDto>> => {
  if (isDevSession())
    return devMock<DashboardChartsDto>({
      monthlyAttendance: [],
      enrollmentsBySport: [],
    });
  return await apiFetch<ApiResult<DashboardChartsDto>>(
    `/api/dashboard/charts?months=${months}&offset=${offset}`,
  );
};
