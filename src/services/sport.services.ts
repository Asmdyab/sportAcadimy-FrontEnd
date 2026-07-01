import { apiFetch } from "@/lib/api";
import { ApiResult, PagedData } from "@/types/api";
import { SportDropDownListDto } from "@/types/SportDropDownListDto";
import { SportDto } from "@/types/SportDto";
import { isDevSession, devMock } from "@/auth/dev-login";

export interface SportSkillLevelDto {
  sportId: string | number;
  name: string;
  description?: string;
}

export const listSports = async (page: number, pageSize: number) => {
  if (isDevSession())
    return devMock<PagedData<SportDto>>({
      items: [],
      totalCount: 0,
      page,
      pageSize,
    });
  return apiFetch<ApiResult<PagedData<SportDto>>>(
    `/api/sports/paginated?page=${page}&pageSize=${pageSize}`,
  );
};

export const searchSports = async (
  term: string,
  page: number,
  pageSize: number,
) => {
  if (isDevSession())
    return devMock<PagedData<SportDto>>({
      items: [],
      totalCount: 0,
      page,
      pageSize,
    });
  return apiFetch<ApiResult<PagedData<SportDto>>>(
    `/api/sports/search?searchTerm=${encodeURIComponent(term)}&page=${page}&pageSize=${pageSize}`,
  );
};

export const countSports = async () => {
  if (isDevSession()) return devMock<number>(0);
  return await apiFetch<ApiResult<number>>(`/api/sports/count`);
};

export const searchSportsName = async (term: string) => {
  if (isDevSession()) return devMock<SportDropDownListDto[]>([]);
  return await apiFetch<ApiResult<SportDropDownListDto[]>>(
    `/api/sports/search-name?searchTerm=${encodeURIComponent(term)}`,
  );
};

export const getSports = async () => {
  if (isDevSession()) return devMock<{ id: number; name: string }[]>([]);
  return await apiFetch<ApiResult<{ id: number; name: string }[]>>(
    `/api/sports`,
  );
};

export const getSportById = async (id: number | string) => {
  if (isDevSession()) return devMock<null>(null);
  return apiFetch<ApiResult<unknown>>(`/api/sports/${id}`);
};

export const deleteSport = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/sports/${id}`, { method: "DELETE" });
};

export const addSkillLevelToSport = async (dto: SportSkillLevelDto) => {
  if (isDevSession()) return devMock<boolean>(true);
  return await apiFetch<ApiResult<string>>(
    `/api/sports/${dto.sportId}/skill-level`,
    {
      method: "POST",
      body: JSON.stringify({
        name: dto.name,
        description: dto.description || null,
      }),
    },
  );
};

// ─── Create / Update (used by sports modals) ─────────────────────────────────

export interface CreateSportCommand {
  name: string;
  description: string | null;
  category: string;
  isRequireHealthTest: boolean;
}

export interface UpdateSportCommand {
  name: string;
  description: string | null;
  category: string;
  isRequireHealthTest: boolean;
}

export const createSport = async (
  data: CreateSportCommand,
): Promise<ApiResult<boolean>> => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>("/api/sports", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateSport = async (
  id: number | string,
  data: UpdateSportCommand,
): Promise<ApiResult<boolean>> => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/sports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
