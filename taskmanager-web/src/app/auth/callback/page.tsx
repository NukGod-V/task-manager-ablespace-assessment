'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setSession } from '@/lib/auth';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      router.push('/login');
      return;
    }
    // Temporarily stash the token so the /auth/me call below can
    // authenticate — setSession() below commits the real, complete session.
    window.localStorage.setItem('accessToken', token);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((user) => {
        setSession(token, {
          id: user.id,
          username: user.username,
          authProvider: user.authProvider,
          email: user.email,
          fullName: user.fullName,
          title: user.title,
        });
        router.replace('/tasks');
      })
      .catch(() => router.push('/login'));
  }, [params, router]);

  return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Signing you in…</div>;
}

// useSearchParams requires a Suspense boundary in the App Router.
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</div>}>
      <CallbackHandler />
    </Suspense>
  );
}