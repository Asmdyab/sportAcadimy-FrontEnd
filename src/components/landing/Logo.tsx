import { Trophy } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2 group">
      <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-athletic-sm group-hover:shadow-athletic-md transition-all">
        <Trophy className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-bold text-lg text-gradient">AURA</span>
    </div>
  );
}
