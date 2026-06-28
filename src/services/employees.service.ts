import { apiFetch } from "@/lib/api";
import { ApiResult, PagedData } from "@/types/api";
import { EmployeeCardDto } from "@/types/EmployeeCardDto";
import { isDevSession, devMock } from "@/auth/dev-login";
import { CreateEmployeeCommand } from "@/types/commands/createEmployeeCommand";
import { UpdateEmployeeCommand } from "@/types/commands/updateEmployeeCommand";

export const listEmployees = (page: number, pageSize: number) => {
  if (isDevSession()) return Promise.resolve(devMock<PagedData<EmployeeCardDto>>({ items: [], totalCount: 0, page, pageSize }));
  return apiFetch<ApiResult<PagedData<EmployeeCardDto>>>(
    `/api/employee?page=${page}&pageSize=${pageSize}`,
  );
};

export const searchEmployees = (
  term: string,
  page: number,
  pageSize: number,
) => {
  if (isDevSession()) return Promise.resolve(devMock<PagedData<EmployeeCardDto>>({ items: [], totalCount: 0, page, pageSize }));
  return apiFetch<ApiResult<PagedData<EmployeeCardDto>>>(
    `/api/employee/search?searchTerm=${encodeURIComponent(term)}&page=${page}&pageSize=${pageSize}`,
  );
};

export const getTotalEmployees = () => {
  if (isDevSession()) return Promise.resolve(devMock<number>(0));
  return apiFetch<ApiResult<number>>("/api/employee/count");
};

export const getActiveEmployees = () => {
  if (isDevSession()) return Promise.resolve(devMock<number>(0));
  return apiFetch<ApiResult<number>>("/api/employee/active/count");
};

export const getBranchsCount = () => {
  if (isDevSession()) return Promise.resolve(devMock<number>(0));
  return apiFetch<ApiResult<number>>("/api/branch/count");
};

export const getEmployeeById = async (id: number | string): Promise<ApiResult<EmployeeCardDto>> => {
  if (isDevSession()) return devMock<EmployeeCardDto>(null as unknown as EmployeeCardDto);
  return apiFetch<ApiResult<EmployeeCardDto>>(`/api/employee/${id}`);
};

export const deleteEmployee = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/employee/${id}`, { method: "DELETE" });
};

export const toggleEmployeeStatus = async (id: number | string) => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/employee/${id}/toggle-status`, { method: "PATCH" });
};

export const createEmployee = async (
  data: CreateEmployeeCommand,
): Promise<ApiResult<number>> => {
  if (isDevSession()) return devMock<number>(0);
  return apiFetch<ApiResult<number>>("/api/employee", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateEmployee = async (
  id: number | string,
  data: UpdateEmployeeCommand,
): Promise<ApiResult<boolean>> => {
  if (isDevSession()) return devMock<boolean>(true);
  return apiFetch<ApiResult<boolean>>(`/api/employee/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
