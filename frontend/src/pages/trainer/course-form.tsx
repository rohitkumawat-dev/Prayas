import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/toast-context';
import { Skeleton } from '@/components/ui/skeleton';
import { trainerApi } from '@/services/trainer';
import { coursesApi } from '@/services/courses';
import { useSEO } from '@/hooks/use-seo';

export default function TrainerCourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  useSEO({ title: id ? 'Edit Course' : 'Create New Course', description: 'Build or edit a course on Capacity Connect.', noindex: true });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    difficulty: 'beginner',
    duration_hours: '',
    is_published: false
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCourse = async () => {
        try {
          setLoading(true);
          const res = await coursesApi.getCourse(Number(id));
          const c = res.data;
          if (c) {
            setFormData({
              title: c.title || '',
              description: c.description || '',
              category: c.category || 'Development',
              difficulty: c.difficulty || 'beginner',
              duration_hours: c.duration_hours?.toString() || '10',
              is_published: !!c.is_published
            });
          }
        } catch (err: any) {
          toast({ title: 'Failed to load course', description: err.message, type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      duration_hours: Number(formData.duration_hours) || 0
    };

    try {
      if (id) {
        await trainerApi.updateCourse(Number(id), payload);
        toast({ title: 'Course updated successfully', type: 'success' });
      } else {
        await trainerApi.createCourse(payload);
        toast({ title: 'Course created successfully', type: 'success' });
      }
      navigate('/trainer/courses');
    } catch (err: any) {
      toast({ title: 'Failed to save course', description: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">{id ? 'Edit Course' : 'Create New Course'}</h1>
        <p className="text-slate-400">Fill in the details below to set up your course.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
        <Input 
          label="Course Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="flex w-full rounded-md border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select 
            label="Category"
            name="category"
            options={[
              { value: 'Development', label: 'Development' },
              { value: 'Data Science', label: 'Data Science' },
              { value: 'Design', label: 'Design' },
              { value: 'Business', label: 'Business' },
              { value: 'Marketing', label: 'Marketing' },
            ]}
            value={formData.category}
            onChange={handleChange}
          />
          
          <Select 
            label="Difficulty"
            name="difficulty"
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            value={formData.difficulty}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Duration (Hours)"
            name="duration_hours"
            type="number"
            min="1"
            value={formData.duration_hours}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
          <input 
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
            className="w-4 h-4 text-violet-500 bg-slate-900 border-slate-700 rounded focus:ring-violet-500"
          />
          <label htmlFor="is_published" className="text-sm font-medium text-slate-200">
            Publish this course immediately
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="ghost" onClick={() => navigate('/trainer/courses')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            {id ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}
