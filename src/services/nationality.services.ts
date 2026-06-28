import { apiFetch } from "@/lib/api";
import { ApiResult } from "@/types/api";
import { isDevSession, devMock } from "@/auth/dev-login";

export interface NationalityDto {
  id: number;
  name: string;
}

export const getNationalities = async () => {
  if (isDevSession()) return devMock<NationalityDto[]>([
    { id: 1, name: "American" },
    { id: 2, name: "Canadian" },
    { id: 3, name: "British" },
    { id: 4, name: "Australian" },
    { id: 5, name: "Chinese" },
    { id: 6, name: "Korean" },
    { id: 7, name: "Japanese" },
    { id: 8, name: "Indian" },
    { id: 9, name: "Russian" },
    { id: 10, name: "SouthAfrican" },
    { id: 11, name: "Egyptian" },
    { id: 12, name: "Turkish" },
    { id: 13, name: "Kuwaiti" },
    { id: 14, name: "Saudi" },
    { id: 15, name: "Emirati" },
    { id: 16, name: "Moroccan" },
    { id: 17, name: "Algerian" },
    { id: 18, name: "Omanian" },
    { id: 19, name: "Qatari" },
    { id: 20, name: "Jordanian" },
    { id: 21, name: "Syrian" },
    { id: 22, name: "Lebanese" },
    { id: 23, name: "Pakistani" },
    { id: 24, name: "Filipino" },
    { id: 25, name: "Palestinian" },
    { id: 26, name: "Other" },
  ]);
  return await apiFetch<ApiResult<NationalityDto[]>>(
    `/api/nationalities`,
  );
};
