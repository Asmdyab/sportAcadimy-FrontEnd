export interface SessionOccurrenceBriefDto {
  id: number;
  /** ISO datetime string */
  startDateTime: string;
  traineesCount: number;
  totalEnrolled: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

export interface SessionGroupDto {
  traineeGroupId: number;
  traineeGroupName: string;
  sportName: string;
  coachName: string;
  branchName: string;
  durationInMinutes: number;
  occurrences: SessionOccurrenceBriefDto[];
}
