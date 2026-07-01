import { apiFetch, ApiError } from "@/lib/api";
import { ApiResult, PagedData } from "@/types/api";
import { BranchCardDto } from "@/types/BranchCardDto";
import { isDevSession, devMock } from "@/auth/dev-login";

export interface BranchEditData {
  id: number;
  name: string;
  city: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  coX?: string;
  coY?: string;
  isActive?: boolean;
}

export interface BranchCreateData {
  name: string;
  city: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  coX?: string;
  coY?: string;
}

export const countBranches = async () => {
  if (isDevSession()) return devMock<number>(0);
  return apiFetch<ApiResult<number>>("/api/branch/count");
};

export const getBranches = async () => {
  if (isDevSession()) return devMock<{ id: number; name: string }[]>([]);
  return apiFetch<ApiResult<{ id: number; name: string }[]>>(
    `/api/branch/dropdown`,
  );
};

export const listBranches = async (page: number, pageSize: number) => {
  if (isDevSession())
    return devMock<PagedData<BranchCardDto>>({
      items: [],
      totalCount: 0,
      page,
      pageSize,
    });
  return apiFetch<ApiResult<PagedData<BranchCardDto>>>(
    `/api/branch?page=${page}&pageSize=${pageSize}`,
  );
};

export const searchBranches = async (
  term: string,
  page: number,
  pageSize: number,
) => {
  if (isDevSession())
    return devMock<PagedData<BranchCardDto>>({
      items: [],
      totalCount: 0,
      page,
      pageSize,
    });
  return apiFetch<ApiResult<PagedData<BranchCardDto>>>(
    `/api/branch/search?searchTerm=${encodeURIComponent(term)}&page=${page}&pageSize=${pageSize}`,
  );
};

export const getBranchById = async (id: number | string) => {
  if (isDevSession()) return devMock<null>(null);
  return apiFetch<ApiResult<unknown>>(`/api/branch/${id}`);
};

export const deleteBranch = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/branch/${id}`, {
    method: "DELETE",
  });
};

export const deactivateBranch = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  const result = await apiFetch<ApiResult<boolean>>(`/api/branch/${id}/deactivate`, {
    method: "PATCH",
  });
  if (!result.isSuccess) throw new ApiError(result.statusCode, { message: result.message });
  return result;
};

export const activateBranch = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  const result = await apiFetch<ApiResult<boolean>>(`/api/branch/${id}/activate`, {
    method: "PATCH",
  });
  if (!result.isSuccess) throw new ApiError(result.statusCode, { message: result.message });
  return result;
};

export interface BranchStatsDto {
  totalTrainees: number;
  totalCoaches: number;
  activeGroups: number;
  activeSessions: number;
}

export const getBranchStats = async (id: number | string) => {
  if (isDevSession())
    return devMock<BranchStatsDto>({
      totalTrainees: 0,
      totalCoaches: 0,
      activeGroups: 0,
      activeSessions: 0,
    });
  return apiFetch<ApiResult<BranchStatsDto>>(`/api/branch/${id}/stats`);
};

export const updateBranch = async (branch: BranchEditData) => {
  if (isDevSession()) return devMock<boolean>(true);
  const result = await apiFetch<ApiResult<boolean>>(`/api/branch/${branch.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: branch.name.trim(),
      city: branch.city.trim(),
      country: branch.country.trim(),
      phoneNumber: branch.phoneNumber.trim(),
      email: branch.email.trim() || null,
      coX: branch.coX !== "" ? branch.coX : "",
      coY: branch.coY !== "" ? branch.coY : "",
      isActive: branch.isActive,
    }),
  });
  if (!result.isSuccess) throw new ApiError(result.statusCode, { message: result.message });
  return result;
};

export const createBranch = async (branch: BranchCreateData) => {
  if (isDevSession()) return devMock<boolean>(true);
  const result = await apiFetch<ApiResult<boolean>>("/api/branch", {
    method: "POST",
    body: JSON.stringify({
      name: branch.name.trim(),
      city: branch.city.trim(),
      country: branch.country.trim(),
      phoneNumber: branch.phoneNumber.trim(),
      email: branch.email.trim() || null,
      coX: branch.coX !== "" ? branch.coX : "",
      coY: branch.coY !== "" ? branch.coY : "",
    }),
  });
  if (!result.isSuccess) throw new ApiError(result.statusCode, { message: result.message });
  return result;
};
