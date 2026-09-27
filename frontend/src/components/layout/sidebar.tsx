import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Award, 
  User as UserIcon,
  Users,
  BarChart3,
  GraduationCap,
  UserCheck,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const traineeLinks = [
    { name: 'Dashboard', href: '/trainee/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/trainee/courses', icon: BookOpen },
    { name: 'Progress', href: '/trainee/progress', icon: TrendingUp },
    { name: 'Certificates', href: '/trainee/certificates', icon: Award },
    { name: 'Profile', href: '/trainee/profile', icon: UserIcon },
  ];

  const trainerLinks = [
    { name: 'Dashboard', href: '/trainer/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/trainer/courses', icon: BookOpen },
    { name: 'Students', href: '/trainer/students', icon: Users },
    { name: 'Analytics', href: '/trainer/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/trainer/profile', icon: UserIcon },
  ];

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Trainees', href: '/admin/trainees', icon: GraduationCap },
    { name: 'Trainers', href: '/admin/trainers', icon: UserCheck },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const links = user.role === 'trainee' ? traineeLinks :
                user.role === 'trainer' ? trainerLinks :
                adminLinks;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold text-violet-400">CC.</span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-violet-500/10 text-violet-400" 
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">
              {user.is_super_admin ? (
                <span className="text-violet-400 font-medium">Super Admin</span>
              ) : (
                user.role
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
