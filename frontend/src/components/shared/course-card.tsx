import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen } from 'lucide-react';
import { Course } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

interface CourseCardProps {
  course: Course;
  className?: string;
  linkPrefix?: string;
}

export function CourseCard({ course, className, linkPrefix = '/trainee/courses' }: CourseCardProps) {
  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'error'
  } as const;

  return (
    <Link 
      to={`${linkPrefix}/${course.id}`}
      className={cn(
        "group flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/10 transition-all",
        className
      )}
    >
      <div className="relative h-40 bg-slate-800 overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <BookOpen className="w-12 h-12 text-slate-700" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="info">{course.category}</Badge>
        </div>
        {course.is_enrolled && (
          <div className="absolute top-3 right-3">
            <Badge variant="success">Enrolled</Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-slate-100 line-clamp-2 group-hover:text-violet-400 transition-colors">
            {course.title}
          </h3>
        </div>
        
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{course.enrollment_count || 0} enrolled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{course.duration_hours}h</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-300">
                {course.trainer_name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-slate-300 truncate max-w-[100px]">
                {course.trainer_name}
              </span>
            </div>
            <Badge variant={difficultyColors[course.difficulty]} size="sm">
              {course.difficulty}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
