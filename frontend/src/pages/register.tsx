import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useSEO } from '@/hooks/use-seo';

export default function RegisterPage() {
  useSEO({
    title: 'Create an Account',
    description: 'Sign up for Capacity Connect as a trainee or trainer and start learning or teaching today.',
    path: '/register',
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('trainee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <Link to="/" className="absolute top-8 left-8 text-xl font-bold text-violet-400 hover:text-violet-300 transition-colors">
        CC<span className="text-cyan-400">.</span>
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-100 mb-2 text-center">Create an account</h1>
        <p className="text-slate-400 text-sm mb-8 text-center">Join Capacity Connect and start learning</p>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
          <Select
            label="I want to"
            value={role}
            onChange={e => setRole(e.target.value)}
            options={[
              { value: 'trainee', label: 'Learn (Trainee)' },
              { value: 'trainer', label: 'Teach (Trainer)' },
            ]}
          />
          <div className="pt-2">
            <Button type="submit" fullWidth isLoading={loading}>
              Create Account
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            Sign in
          </Link>
        </p>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            System Administrator?{' '}
            <Link to="/admin/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
