import { UserPlus, BookOpen, ClipboardCheck, Zap, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardQuickActionsProps {
  onAddTrainee: () => void;
  onNewEnrollment: () => void;
  onMarkAttendance: () => void;
  onGenerateSessions: () => void;
  onAddCoach: () => void;
}

const ACTIONS = [
  {
    label: "Add Trainee",
    icon: UserPlus,
    color: "text-success",
    bg: "bg-success/10 hover:bg-success/20",
    key: "trainee" as const,
    roles: "Admin,Coach,Manager",
  },
  {
    label: "New Enrollment",
    icon: BookOpen,
    color: "text-secondary",
    bg: "bg-secondary/10 hover:bg-secondary/20",
    key: "enrollment" as const,
    roles: "Admin,Coach,Manager",
  },
  {
    label: "Mark Attendance",
    icon: ClipboardCheck,
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/20",
    key: "attendance" as const,
    roles: "Admin,Coach,Manager",
  },
  {
    label: "Generate Sessions",
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10 hover:bg-warning/20",
    key: "sessions" as const,
    roles: "Admin,Coach,Manager",
  },
  {
    label: "Add Coach",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/20",
    key: "coach" as const,
    roles: "Admin,Coach,Manager",
  },
] as const;

export function DashboardQuickActions({
  onAddTrainee,
  onNewEnrollment,
  onMarkAttendance,
  onGenerateSessions,
  onAddCoach,
}: DashboardQuickActionsProps) {
  const { hasRole } = useAuth();
  const handlers: Record<typeof ACTIONS[number]["key"], () => void> = {
    trainee: onAddTrainee,
    enrollment: onNewEnrollment,
    attendance: onMarkAttendance,
    sessions: onGenerateSessions,
    coach: onAddCoach,
  };

  const visibleActions = ACTIONS.filter((a) =>
    a.roles.split(",").some((r) => hasRole(r.trim())),
  );

  if (visibleActions.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {visibleActions.map((action) => (
        <button
          key={action.label}
          onClick={handlers[action.key]}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border ${action.bg} transition-all duration-150 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          <div
            className={`p-2 rounded-lg bg-background/60 ${action.color} group-hover:scale-110 transition-transform duration-150`}
          >
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-foreground text-center leading-tight">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
