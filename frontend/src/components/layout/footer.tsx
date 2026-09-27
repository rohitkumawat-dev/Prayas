import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="text-2xl font-bold text-violet-400 tracking-tight block mb-4">CC.</Link>
          <p className="text-slate-400 max-w-md">
            Capacity Connect is a premium platform for structured learning, training, assessment, and genuine achievement. Build, learn, and grow with us.
          </p>
        </div>
        
        <div>
          <h4 className="text-slate-100 font-semibold mb-4">Platform</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><a href="#" className="hover:text-violet-400 transition-colors">Courses</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Learning Paths</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Assessments</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Certificates</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-slate-100 font-semibold mb-4">Legal</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Cookie Policy</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 text-center md:text-left text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Capacity Connect. All rights reserved.</p>
      </div>
    </footer>
  );
}
