import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/use-seo';

export default function NotFoundPage() {
  useSEO({
    title: 'Page Not Found',
    description: 'The page you are looking for doesn\'t exist or has been moved.',
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-8xl font-bold text-violet-500 mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-semibold text-slate-100 mb-2">Page not found</h2>
      <p className="text-slate-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button size="lg">Return to Home</Button>
      </Link>
    </div>
  );
}
