import React, { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CourseCard } from '@/components/shared/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { coursesApi } from '@/services/courses';
import { Course } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useSEO } from '@/hooks/use-seo';

export default function TraineeCourses() {
  useSEO({ title: 'Course Catalog', description: 'Browse and search available courses by category and difficulty.', noindex: true });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      
      const res = await coursesApi.getCourses(params);
      setCourses(res.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [debouncedSearch, category, difficulty]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Course Catalog</h1>
        <p className="text-slate-400">Discover and enroll in new courses.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select 
            options={[
              { value: '', label: 'All Categories' },
              { value: 'development', label: 'Development' },
              { value: 'design', label: 'Design' },
              { value: 'business', label: 'Business' }
            ]}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <Select 
            options={[
              { value: '', label: 'All Levels' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' }
            ]}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[340px]">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-5 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="pt-4 flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={fetchCourses} />
      ) : courses.length === 0 ? (
        <EmptyState 
          icon={BookOpen}
          title="No courses found"
          description="We couldn't find any courses matching your filters. Try adjusting your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
