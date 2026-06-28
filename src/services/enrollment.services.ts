import { apiFetch } from "@/lib/api";
import { ApiResult, PagedData } from "@/types/api";
import { EnrollmentCardDto } from "@/types/EnrollmentCardDto";
import { EnrollmentDetailDto } from "@/types/EnrollmentDetailDto";
import { isDevSession, devMock } from "@/auth/dev-login";
import { CreateEnrollmentCommand } from "@/types/commands/createEnrollmentCommand";

// ─── Dropdown DTOs ────────────────────────────────────────────────────────────
export interface TraineeDropdownItemDto {
  id: number;
  firstName: string;
  lastName: string;
}

export interface GroupDropdownItemDto {
  id: number;
  name: string;
}

export interface SubscriptionDropdownItemDto {
  id: number;
  name: string;
}

export interface GroupScheduleDto {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface GroupWithSchedulesDto {
  schedules?: GroupScheduleDto[];
  [key: string]: unknown;
}

/** Build a query-string from a params object, omitting "all" / empty values */
function buildQuery(
  base: Record<string, string | number>,
  extra?: Record<string, string>,
): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) p.set(k, String(v));
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v && v !== "all") p.set(k, v);
    }
  }
  return p.toString();
}

export const getEnrollments = async (
  sportId: number,
): Promise<ApiResult<number>> => {
  if (isDevSession()) return devMock<number>(0);
  return await apiFetch<ApiResult<number>>(
    `/api/enrollment/sports/${sportId}/enrollments/count?from=2024-01-01`,
  );
};

/**
 * Fetches enrollment counts for multiple sports in parallel.
 * Returns an array of { sport, enrolled } records in the same order as `sports`.
 * Individual failures are swallowed so one bad sport doesn't kill the chart.
 */
export const getEnrollmentCountsBySport = async (
  sports: { id: number; name: string }[],
): Promise<{ sport: string; enrolled: number }[]> => {
  if (isDevSession())
    return sports.map((s) => ({ sport: s.name, enrolled: 0 }));
  const results = await Promise.allSettled(
    sports.map((s) =>
      apiFetch<ApiResult<number>>(
        `/api/enrollment/sports/${s.id}/enrollments/count?from=2024-01-01`,
      ),
    ),
  );
  return results.map((r, i) => ({
    sport: sports[i].name,
    enrolled:
      r.status === "fulfilled" && r.value.isSuccess ? (r.value.data ?? 0) : 0,
  }));
};

export const listEnrollments = async (
  page: number,
  pageSize: number,
  extraParams?: Record<string, string>,
) => {
  if (isDevSession())
    return devMock<PagedData<EnrollmentCardDto>>({
      items: [],
      totalCount: 0,
      page,
      pageSize,
    });
  const qs = buildQuery({ page, pageSize }, extraParams);
  return apiFetch<ApiResult<PagedData<EnrollmentCardDto>>>(
    `/api/enrollment?${qs}`,
  );
};

export const searchEnrollments = async (
  term: string,
  page: number,
  pageSize: number,
  extraParams?: Record<string, string>,
) => {
  if (isDevSession())
    return devMock<PagedData<EnrollmentCardDto>>({
      items: [],
      totalCount: 0,
      page,
      pageSize,
    });
  const qs = buildQuery(
    { term: encodeURIComponent(term), page, pageSize },
    extraParams,
  );
  return apiFetch<ApiResult<PagedData<EnrollmentCardDto>>>(
    `/api/enrollment/search?${qs}`,
  );
};

export const countAllEnrollments = async () => {
  if (isDevSession()) return devMock<number>(0);
  return apiFetch<ApiResult<number>>("/api/enrollment/count");
};

export const countActiveEnrollments = async () => {
  if (isDevSession()) return devMock<number>(0);
  return apiFetch<ApiResult<number>>("/api/enrollment/count/active");
};

export const countPendingPayments = async () => {
  if (isDevSession()) return devMock<number>(0);
  return apiFetch<ApiResult<number>>("/api/enrollment/count/pending-payment");
};

export const getEnrollmentById = async (id: number | string) => {
  if (isDevSession()) return devMock<EnrollmentDetailDto | null>(null);
  return apiFetch<ApiResult<EnrollmentDetailDto>>(`/api/enrollment/${id}`);
};

export const deleteEnrollment = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/enrollment/${id}`, {
    method: "DELETE",
  });
};

export const activateEnrollment = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/enrollment/${id}/activate`, {
    method: "PATCH",
  });
};

export const suspendEnrollment = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/enrollment/${id}/suspend`, {
    method: "PATCH",
  });
};

export const updatePaymentStatus = async (
  id: number | string,
  paymentStatus: string,
) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/enrollment/${id}/payment-status`, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
  });
};

export const updateEnrollment = async (
  id: number | string,
  data: {
    expiryDate?: string | null;
    sessionAllowed?: number | null;
    subscriptionDetailsId?: number | null;
  },
) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/enrollment/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ─── Dropdown loaders used by modals ─────────────────────────────────────────

export const getTraineesDropdown = async (): Promise<
  ApiResult<TraineeDropdownItemDto[]>
> => {
  if (isDevSession()) return devMock<TraineeDropdownItemDto[]>([]);
  return apiFetch<ApiResult<TraineeDropdownItemDto[]>>("/api/trainee/dropdown");
};

export const getGroupsDropdown = async (): Promise<
  ApiResult<GroupDropdownItemDto[]>
> => {
  if (isDevSession()) return devMock<GroupDropdownItemDto[]>([]);
  return apiFetch<ApiResult<GroupDropdownItemDto[]>>(
    "/api/traineeGroup/dropdown",
  );
};

export const getSubscriptionsDropdown = async (): Promise<
  ApiResult<SubscriptionDropdownItemDto[]>
> => {
  if (isDevSession()) return devMock<SubscriptionDropdownItemDto[]>([]);
  return apiFetch<ApiResult<SubscriptionDropdownItemDto[]>>(
    "/api/subscriptionDetails/dropdown",
  );
};

export const getGroupSchedules = async (
  groupId: number | string,
): Promise<ApiResult<GroupWithSchedulesDto>> => {
  if (isDevSession()) return devMock<GroupWithSchedulesDto>({});
  return apiFetch<ApiResult<GroupWithSchedulesDto>>(
    `/api/traineeGroup/${groupId}`,
  );
};

export const createEnrollment = async (
  data: CreateEnrollmentCommand,
): Promise<ApiResult<boolean>> => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>("/api/enrollment", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
