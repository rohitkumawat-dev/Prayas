import { Link } from 'react-router-dom';
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particle-typography';
import { PixelCanvas } from '@/components/ui/pixel-canvas';
import { ScrollBackdrop } from '@/components/ui/scroll-backdrop';
import {
  BookOpen, Users, Award, TrendingUp, ClipboardCheck,
  Plus, ChevronRight, GraduationCap, UserCheck, Shield,
  BarChart3, Target, Layers, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { useSEO } from '@/hooks/use-seo';

const journeySteps = [
  { icon: Plus, title: 'CREATE', description: 'Trainers build structured courses with modules, lessons, and assessments', color: 'text-violet-400' },
  { icon: BookOpen, title: 'LEARN', description: 'Trainees engage with rich learning materials at their own pace', color: 'text-cyan-400' },
  { icon: ClipboardCheck, title: 'ASSESS', description: 'Knowledge is validated through quizzes and scored assessments', color: 'text-emerald-400' },
  { icon: TrendingUp, title: 'TRACK', description: 'Real progress tracking with meaningful analytics and insights', color: 'text-amber-400' },
  { icon: Award, title: 'ACHIEVE', description: 'Earn certificates that reflect genuine accomplishment', color: 'text-rose-400' },
];

function LandingContent({ isReducedMotion }: { isReducedMotion: boolean }) {
  useSEO({
    title: 'Skill Training & Certification Platform',
    description: 'Capacity Connect connects trainees, trainers, and administrators — browse courses, complete lessons and quizzes, track progress, and earn certificates.',
    path: '/',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lenis = useLenis();

  // Track scroll progress with Lenis callback or native fallback
  useLenis((lenisInstance) => {
    if (!isReducedMotion && lenisInstance.progress !== undefined) {
      setScrollProgress(lenisInstance.progress);
    }
  });

  useEffect(() => {
    if (isReducedMotion) {
      const handleScroll = () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) {
          setScrollProgress(window.scrollY / total);
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isReducedMotion]);

  // Smooth anchor navigation handler
  const scrollToSection = (targetId: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById(targetId);
    if (!el) return;

    if (lenis && !isReducedMotion) {
      lenis.scrollTo(el, { offset: -70, duration: 1.15 });
    } else {
      el.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
    }

    // Preserve URL hash and accessible focus
    window.history.pushState(null, '', `#${targetId}`);
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    setMobileMenuOpen(false);
  };

  // Handle direct hash navigation on initial page load
  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const timer = setTimeout(() => {
        scrollToSection(targetId);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [lenis, isReducedMotion]);

  return (
    <div className="relative isolate min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Scroll-driven background transition */}
      <ScrollBackdrop reducedMotion={isReducedMotion} />

      {/* Subtle craft scroll progress indicator */}
      <div 
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-transparent pointer-events-none"
        aria-hidden="true"
      >
        <div 
          className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-400 origin-left transition-transform duration-75 ease-out"
          style={{ transform: `scaleX(${Math.max(0, Math.min(1, scrollProgress))})` }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-slate-100 tracking-tight">
              Capacity<span className="text-violet-400">Connect</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a 
                href="#journey" 
                onClick={(e) => scrollToSection('journey', e)}
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Journey
              </a>
              <a 
                href="#capabilities" 
                onClick={(e) => scrollToSection('capabilities', e)}
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Platform
              </a>
              <a 
                href="#roles" 
                onClick={(e) => scrollToSection('roles', e)}
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Roles
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm text-slate-300 hover:text-white px-4 py-2 transition-colors">
                Log In
              </Link>
              <Link to="/register" className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg transition-colors font-medium">
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-800">
              <div className="flex flex-col gap-2 pt-4">
                <a 
                  href="#journey" 
                  className="text-sm text-slate-400 hover:text-white py-2" 
                  onClick={(e) => scrollToSection('journey', e)}
                >
                  Journey
                </a>
                <a 
                  href="#capabilities" 
                  className="text-sm text-slate-400 hover:text-white py-2" 
                  onClick={(e) => scrollToSection('capabilities', e)}
                >
                  Platform
                </a>
                <a 
                  href="#roles" 
                  className="text-sm text-slate-400 hover:text-white py-2" 
                  onClick={(e) => scrollToSection('roles', e)}
                >
                  Roles
                </a>
                <div className="flex gap-3 pt-2">
                  <Link to="/login" className="text-sm text-slate-300 hover:text-white py-2">Log In</Link>
                  <Link to="/register" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg">Get Started</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          {/* Particle Typography Hero Visual */}
          <div className="relative w-full h-[100px] sm:h-[130px] md:h-[160px] lg:h-[180px] flex items-center justify-center">
            <CursorDrivenParticleTypography text="CAPACITY CONNECT" />
          </div>

          {/* Tagline & Call-to-Actions */}
          <div className="text-center mt-4 sm:mt-6 max-w-3xl mx-auto">
            <p className="text-base sm:text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-normal">
              A premium platform for structured learning, training, assessment, and measurable achievement.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium text-base transition-colors shadow-lg shadow-violet-600/20"
              >
                Start Learning <ChevronRight size={18} />
              </Link>
              <a
                href="#journey"
                onClick={(e) => scrollToSection('journey', e)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-medium text-base transition-colors"
              >
                Explore Platform
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
      </section>

      {/* Product Statement */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-6 leading-tight">
            Where structured learning meets<br />
            <span className="text-violet-400">measurable outcomes</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Capacity Connect connects trainees, trainers, and administrators in a unified platform
            designed for real skill development — not just content consumption.
          </p>
        </div>
      </section>

      {/* PixelCanvas Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative h-[200px] sm:h-[260px] w-full overflow-hidden rounded-xl border border-slate-800 bg-neutral-950">
            <PixelCanvas colors={['#e879f9', '#a78bfa', '#38bdf8', '#22d3ee']} speed={0.02} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4">
                <p className="text-2xl sm:text-3xl font-bold text-white/90 mb-2">Built for real learning</p>
                <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
                  Every feature connects to real data. Progress is earned, not fabricated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Journey */}
      <section id="journey" className="py-24 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">The Learning Journey</h2>
            <p className="text-slate-400 max-w-lg mx-auto">A structured path from course creation to certified achievement</p>
          </div>

          {/* Desktop horizontal timeline */}
          <div className="hidden md:flex items-start justify-between relative">
            <div className="absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-violet-500/40 via-cyan-500/40 to-rose-500/40" />
            {journeySteps.map((step) => (
              <div key={step.title} className="flex flex-col items-center text-center relative z-10 w-1/5">
                <div className={`w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center mb-4 ${step.color}`}>
                  <step.icon size={24} />
                </div>
                <h3 className={`text-sm font-bold tracking-wider mb-2 ${step.color}`}>{step.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed px-2">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile vertical timeline */}
          <div className="md:hidden space-y-1">
            {journeySteps.map((step, i) => (
              <div key={step.title} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shrink-0 ${step.color}`}>
                    <step.icon size={20} />
                  </div>
                  {i < journeySteps.length - 1 && <div className="w-px h-12 bg-slate-700/50" />}
                </div>
                <div className="pt-2 pb-6">
                  <h3 className={`text-sm font-bold tracking-wider mb-1 ${step.color}`}>{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section id="capabilities" className="py-24 px-4 bg-slate-900/30 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">Platform Capabilities</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Everything needed for effective learning at scale</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8">
              <div className="w-12 h-12 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
                <Layers size={22} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">Course Management</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-violet-400" />Structured modules and lessons</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-violet-400" />Rich text content support</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-violet-400" />Difficulty levels and categories</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-violet-400" />Publishing and enrollment control</li>
              </ul>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <BarChart3 size={22} className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">Assessment & Analytics</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-400" />Timed quizzes with scoring</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-400" />Real progress calculation</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-400" />Learning analytics dashboards</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-400" />Needs-attention detection</li>
              </ul>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Target size={22} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">Achievement System</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" />Completion-based certificates</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" />Role-based access control</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" />Platform administration</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" />Printable certificate output</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Experience */}
      <section id="roles" className="py-24 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">Built for Every Role</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Three distinct experiences, one unified platform</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="group border border-slate-800 rounded-xl p-8 hover:border-violet-500/30 transition-colors bg-slate-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><GraduationCap size={20} className="text-violet-400" /></div>
                  <h3 className="text-lg font-semibold text-slate-100">Trainee</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>Browse and enroll in courses</li><li>Learn through structured lessons</li>
                  <li>Take quizzes and assessments</li><li>Track real progress</li><li>Earn completion certificates</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <Link to="/login" className="text-xs text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1 transition-colors">
                  Trainee Portal <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="group border border-slate-800 rounded-xl p-8 hover:border-cyan-500/30 transition-colors bg-slate-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center"><UserCheck size={20} className="text-cyan-400" /></div>
                  <h3 className="text-lg font-semibold text-slate-100">Trainer</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>Create and manage courses</li><li>Build modules, lessons, quizzes</li>
                  <li>Monitor student progress</li><li>View learning analytics</li><li>Identify at-risk learners</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <Link to="/login" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors">
                  Trainer Portal <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="group border border-slate-800 rounded-xl p-8 hover:border-emerald-500/30 transition-colors bg-slate-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Shield size={20} className="text-emerald-400" /></div>
                  <h3 className="text-lg font-semibold text-slate-100">Administrator</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>Full platform oversight</li><li>User and role management</li>
                  <li>Course moderation</li><li>Platform analytics</li><li>System configuration</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <Link to="/admin/login" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors">
                  Admin Login <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-slate-900/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">Ready to start your learning journey?</h2>
          <p className="text-slate-400 mb-8">Join Capacity Connect and experience structured, measurable learning.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Create Account <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-slate-100 mb-3">Capacity<span className="text-violet-400">Connect</span></h3>
              <p className="text-sm text-slate-500 leading-relaxed">A premium digital learning and skill-development platform.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/register" className="hover:text-slate-300 transition-colors">Get Started</Link></li>
                <li>
                  <a 
                    href="#journey" 
                    onClick={(e) => scrollToSection('journey', e)}
                    className="hover:text-slate-300 transition-colors"
                  >
                    Learning Journey
                  </a>
                </li>
                <li>
                  <a 
                    href="#capabilities" 
                    onClick={(e) => scrollToSection('capabilities', e)}
                    className="hover:text-slate-300 transition-colors"
                  >
                    Capabilities
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Roles</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/login" className="hover:text-slate-300 transition-colors">Trainee</Link></li>
                <li><Link to="/login" className="hover:text-slate-300 transition-colors">Trainer</Link></li>
                <li><Link to="/admin/login" className="hover:text-slate-300 transition-colors">Administrator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>Privacy Policy</li><li>Terms of Service</li><li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-600">
            © {new Date().getFullYear()} Capacity Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) {
    return <LandingContent isReducedMotion={true} />;
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 1.2,
      }}
    >
      <LandingContent isReducedMotion={false} />
    </ReactLenis>
  );
}
