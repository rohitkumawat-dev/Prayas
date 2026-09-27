import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/toast-context';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/services/admin';
import { useSEO } from '@/hooks/use-seo';

export default function AdminSettings() {
  useSEO({ title: 'Platform Settings', description: 'Configure platform-wide settings.', noindex: true });
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    platform_name: 'Capacity Connect',
    registration_enabled: true,
    max_courses_per_trainer: 20,
    require_quiz_pass_for_certificate: true,
    default_quiz_passing_score: 60
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getSettings();
        if (res.data) {
          setSettings(res.data);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      toast({ title: 'Settings saved successfully', type: 'success' });
    } catch (err: any) {
      toast({ title: 'Failed to save settings', description: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-[500px] w-full max-w-2xl rounded-xl" />;

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Platform Settings</h1>
        <p className="text-slate-400">Configure global behavior and platform rules.</p>
      </header>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8">
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">General</h2>
          <Input 
            label="Platform Name"
            name="platform_name"
            value={settings.platform_name}
            onChange={handleChange}
            required
          />
          
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox"
              id="registration_enabled"
              name="registration_enabled"
              checked={settings.registration_enabled}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="registration_enabled" className="text-sm font-medium text-slate-300">
              Allow public user self-registration
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">Limits & Constraints</h2>
          <Input 
            label="Maximum Courses Per Trainer"
            type="number"
            name="max_courses_per_trainer"
            value={settings.max_courses_per_trainer}
            onChange={handleChange}
            min={1}
            max={100}
            required
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">Assessments & Certification</h2>
          <Input 
            label="Default Passing Score (%)"
            type="number"
            name="default_quiz_passing_score"
            value={settings.default_quiz_passing_score}
            onChange={handleChange}
            min={10}
            max={100}
            required
          />

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox"
              id="require_quiz_pass_for_certificate"
              name="require_quiz_pass_for_certificate"
              checked={settings.require_quiz_pass_for_certificate}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="require_quiz_pass_for_certificate" className="text-sm font-medium text-slate-300">
              Require passing all quizzes to issue completion certificates
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <Button type="submit" isLoading={saving}>
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
