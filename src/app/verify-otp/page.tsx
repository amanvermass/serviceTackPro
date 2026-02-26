'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toastConfig from '@/components/CustomToast';

export default function VerifyOtp() {
  const router = useRouter();
  const email = useSearchParams().get('email');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toastConfig.success('OTP verified');
        router.push(`/reset-password?email=${email}`);
      } else {
        toastConfig.error(data.message || 'Invalid OTP');
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
          <h1>Verify OTP</h1>
          <p>Enter the OTP sent to your email</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>OTP</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login mt-6" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}