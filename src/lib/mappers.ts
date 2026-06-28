import { AttendanceByDateRecordDto } from "@/types/AttendanceDto";
import { ListTraineeGroupDto } from "@/types/ListTraineeGroup";

export type SessionVm = {
  id: number;
  sport: string;
  time: string;
  coach: string;
  trainees: number;
  branch: string;
};

export function mapSessions(list: ListTraineeGroupDto[]): SessionVm[] {
  return list.map((s) => ({
    id: s.id,
    sport: s.sportName,
    time:
      s.schedules
        ?.map((sc) => `${sc.dayOfWeek} ${sc.startTime.slice(0, 5)}`)
        .join(", ") ?? "—",
    coach: s.coachName,
    trainees: s.traineesCount,
    branch: s.branchName,
  }));
}

export function getSessionsCount(list: ListTraineeGroupDto[]) {
  return list.length;
}

export function mapAttendanceToSessions(records: AttendanceByDateRecordDto[]): SessionVm[] {
  const map = new Map<number, SessionVm>();

  for (const r of records) {
    if (!map.has(r.sessionOccurrenceId)) {
      map.set(r.sessionOccurrenceId, {
        id: r.sessionOccurrenceId,
        sport: r.sportName,
        time: r.startTime.slice(0, 5),
        coach: r.coachName,
        trainees: 0,
        branch: r.branchName,
      });
    }
    const session = map.get(r.sessionOccurrenceId)!;
    session.trainees++;
  }

  return Array.from(map.values());
}
