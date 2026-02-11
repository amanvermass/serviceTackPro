'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toastConfig from '@/components/CustomToast';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check for saved email in localStorage
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Handle Remember Me
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toastConfig.success('Login successful! Redirecting...');
        console.log('Login successful:', data);
        
        // Save auth data to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        router.push('/dashboard');
      } else {
        const errorMessage = data.message || 'Login failed';
        setError(errorMessage);
        toastConfig.error(errorMessage);
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = 'Connection refused. Is the backend server running?';
      setError(errorMessage);
      toastConfig.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-header">
          <h1>Domain Manager Pro</h1>
          <p>Sign in to manage your domains securely</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com" 
              required 
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              required 
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-actions">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              /> 
              Remember me
            </label>
            <a href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">Forgot password?</a>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="footer-text">
          © 2025 Domain Manager Pro
        </div>
      </div>
    </div>
  );
}
