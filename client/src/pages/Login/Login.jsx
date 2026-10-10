
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Code2, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1018] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2d1b26] border border-pink-500/30 rounded-xl shadow-2xl p-8">

        {/* Logo and Heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-pink-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-pink-600/20">
            <Code2 className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">
            Welcome to CodeCollab
          </h1>

          <p className="text-xs text-pink-200/60 mt-1 text-center">
            Sign in to your collaborative workspace
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-pink-950/40 border border-pink-800 text-pink-300 text-xs">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="developer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            loading={loading}
            icon={ArrowRight}
          >
            Sign In
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-pink-200/60">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-pink-400 hover:text-pink-300 hover:underline font-medium"
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};

