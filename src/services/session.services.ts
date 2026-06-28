import { apiFetch } from "@/lib/api";
import { ApiResult, PagedData } from "@/types/api";
import { SessionOccurrenceDto } from "@/types/AttendanceDto";
import { SessionGroupDto } from "@/types/SessionGroup";
import { ListTraineeGroupDto } from "@/types/ListTraineeGroup";
import { isDevSession, devMock } from "@/auth/dev-login";

/** List all sessions (paginated) */
export const listSessions = (page: number, pageSize: number) => {
  if (isDevSession())
    return Promise.resolve(
      devMock<PagedData<SessionOccurrenceDto>>({
        items: [],
        totalCount: 0,
        page,
        pageSize,
      }),
    );
  return apiFetch<ApiResult<PagedData<SessionOccurrenceDto>>>(
    `/api/sessionOccurrence?page=${page}&pageSize=${pageSize}`,
  );
};

/** Full-text search across sport, coach, or branch */
export const searchSessions = (
  term: string,
  page: number,
  pageSize: number,
) => {
  if (isDevSession())
    return Promise.resolve(
      devMock<PagedData<SessionOccurrenceDto>>({
        items: [],
        totalCount: 0,
        page,
        pageSize,
      }),
    );
  return apiFetch<ApiResult<PagedData<SessionOccurrenceDto>>>(
    `/api/sessionOccurrence/search?searchTerm=${encodeURIComponent(term)}&page=${page}&pageSize=${pageSize}`,
  );
};

/** Fetch sessions for a specific ISO date */
export const getSessionsByDate = (
  date: string,
  page: number,
  pageSize: number,
  traineeGroupId?: number,
) => {
  if (isDevSession())
    return Promise.resolve(
      devMock<PagedData<SessionOccurrenceDto>>({
        items: [],
        totalCount: 0,
        page,
        pageSize,
      }),
    );
  let url = `/api/sessionOccurrence/by-date?date=${date}&page=${page}&pageSize=${pageSize}`;
  if (traineeGroupId !== undefined) url += `&traineeGroupId=${traineeGroupId}`;
  return apiFetch<ApiResult<PagedData<SessionOccurrenceDto>>>(url);
};

/** Fetch grouped sessions for a specific ISO date (pagination on groups, not occurrences) */
export const getSessionGroupsByDate = (
  date: string,
  page: number,
  pageSize: number,
  traineeGroupId?: number,
) => {
  if (isDevSession())
    return Promise.resolve(
      devMock<PagedData<SessionGroupDto>>({
        items: [],
        totalCount: 0,
        page,
        pageSize,
      }),
    );
  let url = `/api/sessionOccurrence/groups-by-date?date=${date}&page=${page}&pageSize=${pageSize}`;
  if (traineeGroupId !== undefined) url += `&traineeGroupId=${traineeGroupId}`;
  return apiFetch<ApiResult<PagedData<SessionGroupDto>>>(url);
};

/** Total session count */
export const countSessions = () => {
  if (isDevSession()) return Promise.resolve(devMock<number>(0));
  return apiFetch<ApiResult<number>>("/api/sessionOccurrence/count");
};

/** List trainee groups for the group picker (paginated, used in OperateGroupModal) */
export const listTraineeGroupsForPicker = (page: number, pageSize: number) => {
  if (isDevSession())
    return Promise.resolve(
      devMock<PagedData<ListTraineeGroupDto>>({
        items: [],
        totalCount: 0,
        page,
        pageSize,
      }),
    );
  return apiFetch<ApiResult<PagedData<ListTraineeGroupDto>>>(
    `/api/traineeGroup?page=${page}&pageSize=${pageSize}`,
  );
};

/** Search trainee groups by name (used in OperateGroupModal) */
export const searchTraineeGroupsForPicker = (
  term: string,
  page: number,
  pageSize: number,
) => {
  if (isDevSession())
    return Promise.resolve(
      devMock<PagedData<ListTraineeGroupDto>>({
        items: [],
        totalCount: 0,
        page,
        pageSize,
      }),
    );
  return apiFetch<ApiResult<PagedData<ListTraineeGroupDto>>>(
    `/api/traineeGroup/search?searchTerm=${encodeURIComponent(term)}&page=${page}&pageSize=${pageSize}`,
  );
};

export interface GenerateSessionsCommand {
  traineeGroupId: number;
  durationInDays: number;
  groupScheduleId?: number | null;
  startDate?: string | null;
}

/** POST to generate session occurrences for a Trainee Group */
export const generateSessions = async (command: GenerateSessionsCommand) => {
  if (isDevSession())
    return devMock<boolean>(true, "Dev mode: sessions generation skipped");
  return apiFetch<ApiResult<number>>("/api/sessionOccurrence/generate", {
    method: "POST",
    body: JSON.stringify({
      traineeGroupId: command.traineeGroupId,
      durationInDays: command.durationInDays,
      groupScheduleId: command.groupScheduleId ?? null,
      startDate: command.startDate ?? null,
    }),
  });
};
