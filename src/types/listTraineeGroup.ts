export type GroupScheduleDto = {
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  startTime: string; // "16:30:00"
};

export type ListTraineeGroupDto = {
  id: number;
  name: string;
  sportName: string;
  coachName: string;
  branchName: string;
  durationInMinutes: number;
  traineesCount: number;
  schedules: GroupScheduleDto[];
};
