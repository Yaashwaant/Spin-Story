"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

function ResetPasswordForm() {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const [pwd, setPwd] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/reset-password-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: pwd }),
    });
    if (res.ok) setDone(true);
    else alert('Invalid or expired link');
  };

  if (done)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 font-serif">Password updated!</h2>
          <a href="/login" className="text-primary hover:underline">Sign in</a>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold font-serif">Set a new password</h2>
        <input
          type="password"
          placeholder="New password"
          required
          className="w-full px-3 py-2 border rounded"
          onChange={(e) => setPwd(e.target.value)}
        />
        <button type="submit" className="w-full bg-black text-white py-2 rounded">
          Reset password
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}