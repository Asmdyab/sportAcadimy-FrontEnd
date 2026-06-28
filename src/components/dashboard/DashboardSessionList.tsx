import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionListItemSkeleton } from "@/components/ui/TableRowSkeleton";
import { Calendar, Users, MapPin, ArrowRight } from "lucide-react";
import { SessionVm } from "@/lib/mappers";

interface DashboardSessionListProps {
  loading: boolean;
  sessions: SessionVm[];
  todayIso: string;
  onViewAll: () => void;
  onSessionClick: () => void;
}

export function DashboardSessionList({
  loading,
  sessions,
  onViewAll,
  onSessionClick,
}: DashboardSessionListProps) {
  return (
    <Card className="card-athletic">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Sessions
          </div>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SessionListItemSkeleton count={4} />
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Calendar className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No attendance records for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={onSessionClick}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-medium">
                      {session.sport}
                    </Badge>
                    <span className="text-sm font-medium">{session.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Coach: {session.coach}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {session.trainees} trainees
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.branch}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
