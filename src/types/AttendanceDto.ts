/**
 * AttendanceRecordDto
 *
 * Represents a single trainee's attendance record within a session occurrence.
 */
export type AttendanceStatus = "Present" | "Absent" | "Excused";

export interface AttendanceRecordDto {
  id: number;
  traineeId: number;
  traineeName: string;
  /** "HH:mm:ss" */
  checkInTime: string | null;
  status: AttendanceStatus;
}

/**
 * SessionOccurrenceDto
 *
 * A materialized session occurrence returned by GET /api/SessionOccurrence/by-date.
 * Maps to the backend SessionOccurrenceCardDto.
 */
export interface SessionOccurrenceDto {
  id: number;
  sportName: string;
  coachName: string;
  branchName: string;
  traineeGroupId: number;
  traineeGroupName: string;
  /** ISO datetime string */
  startTime: string;
  durationInMinutes: number;
  /** Total enrolled trainees */
  traineesCount: number;
  totalEnrolled: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  /** ISO date "YYYY-MM-DD" */
  date: string;
}

/**
 * AttendanceByDateRecordDto
 *
 * An attendance record with full session context, returned by
 * GET /api/attendance/by-date. Grouped by sessionOccurrenceId on the frontend.
 */
export interface AttendanceByDateRecordDto {
  id: number;
  sessionOccurrenceId: number;
  sportName: string;
  coachName: string;
  branchName: string;
  /** ISO datetime string */
  startTime: string;
  durationInMinutes: number;
  traineeId: number;
  traineeName: string;
  /** "HH:mm:ss" */
  checkInTime: string | null;
  status: AttendanceStatus;
  /** ISO date "YYYY-MM-DD" */
  attendanceDate: string;
}

/**
 * MarkAttendanceCommand
 *
 * Sent to POST /api/attendance to record a trainee's attendance.
 */
/**
 * TraineeAttendanceReportDto
 *
 * Returned by GET /api/attendance/report (paginated).
 */
export interface TraineeAttendanceReportDto {
  traineeId: number;
  firstName: string;
  lastName: string;
  groupId: number;
  groupName: string;
  sportName: string;
  branchName: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  enrollmentId: number;
  isActive: boolean;
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  attendanceRate: number;
  absenceRate: number;
  consecutiveAbsences: number;
}

export interface MarkAttendanceCommand {
  sessionOccurrenceId: number;
  traineeId: number;
  status: AttendanceStatus;
  /** "HH:mm" optional check-in time override */
  checkInTime?: string;
}
