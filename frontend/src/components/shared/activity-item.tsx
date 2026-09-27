import { LucideIcon, BookOpen, CheckCircle, Award, PlayCircle } from 'lucide-react';
import { formatDate } from '@/utils/format';

interface ActivityItemProps {
  activity?: {
    id?: number;
    type?: string;
    description: string;
    created_at?: string;
    timestamp?: string;
    user_name?: string;
  };
  icon?: LucideIcon;
  description?: string;
  timestamp?: string;
  iconColor?: string;
}

export function ActivityItem({ activity, icon: CustomIcon, description, timestamp, iconColor }: ActivityItemProps) {
  const desc = activity?.description || description || '';
  const time = activity?.created_at || activity?.timestamp || timestamp || '';
  const type = activity?.type || '';

  let Icon = CustomIcon || BookOpen;
  let color = iconColor || 'text-violet-400';

  if (!CustomIcon && type) {
    if (type === 'course_complete') {
      Icon = Award;
      color = 'text-amber-400';
    } else if (type === 'certificate_issued') {
      Icon = Award;
      color = 'text-emerald-400';
    } else if (type === 'lesson_complete') {
      Icon = CheckCircle;
      color = 'text-cyan-400';
    } else if (type === 'enrollment') {
      Icon = PlayCircle;
      color = 'text-violet-400';
    }
  }

  return (
    <div className="flex gap-4 p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
      <div className="shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 leading-snug">
          {activity?.user_name && <span className="font-semibold text-slate-100 mr-1.5">{activity.user_name}:</span>}
          {desc}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {formatDate(time)}
        </p>
      </div>
    </div>
  );
}
