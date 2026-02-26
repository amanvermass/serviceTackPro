'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toastConfig from '@/components/CustomToast';

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toastConfig.success('OTP sent to your email');
        router.push(`/verify-otp?email=${email}`); // ✅ direct redirect
      } else {
        toastConfig.error(data.message || 'Failed to send OTP');
      }
    } catch {
      toastConfig.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a verification OTP</p>
        </div>

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn-login mt-6" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <div className="text-center mt-6">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary">
              ← Back to Login
            </Link>
          </div>
        </form>

        <div className="footer-text">
          © 2025 Domain Manager Pro
        </div>
      </div>
    </div>
  );
}