'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive password reset instructions</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="you@example.com" 
                required 
                className="input" 
              />
            </div>

            <button type="submit" className="btn-login mt-6" disabled={loading}>
              {loading ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>

            <div className="text-center mt-6">
              <Link href="/" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                ← Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Check your email</h3>
            <p className="text-text-secondary mb-6">
              We have sent password reset instructions to your email address.
            </p>
            <Link href="/" className="btn btn-primary w-full block">
              Return to Login
            </Link>
          </div>
        )}

        <div className="footer-text">
          © 2025 Domain Manager Pro
        </div>
      </div>
    </div>
  );
}
