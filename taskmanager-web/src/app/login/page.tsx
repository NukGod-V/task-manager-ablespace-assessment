'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClearStepLogo } from '@/components/icons/clearstep-logo';
import { GoogleIcon } from '@/components/icons/google-icon';
import { guestLogin } from '@/lib/api';
import { setSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState(false);

  async function handleGuestLogin() {
    setLoading(true);
    setError(null);
    try {
      const { accessToken, user } = await guestLogin();
      setSession(accessToken, user);
      router.push('/tasks');
    } catch {
      setError('Could not start a guest session. Is the API running on :4000?');
      setLoading(false);
    }
  }

  // Button looks and behaves fully active — no disabled/dimmed state — but
  // there's no real Google OAuth wired up yet (Phase 1 only built Guest).
  // Showing an honest inline notice instead of faking a login.
  function handleGoogleClick() {
    setGoogleNotice(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex h-6 w-full max-w-[1200px] items-center justify-center gap-2">
        <ClearStepLogo className="h-4 w-4 text-foreground" />
        <span className="text-sm font-semibold text-foreground">ClearStep</span>
      </div>

      <div className="w-[384px] rounded-xl border border-border bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Let&apos;s get back on track
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Enter your email below to login to your account.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full rounded-full bg-cta-primary py-3 text-sm font-medium text-cta-primary-foreground transition-opacity disabled:opacity-60"
          >
            {loading ? 'Starting session…' : 'Continue as Guest'}
          </button>

          {/* Now fully active-looking — hover state, no opacity/disabled */}
          <button
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/google`;
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-active"
          >
            <GoogleIcon className="text-muted"/>
            Login with Google
          </button>
        </div>
      </div>

      <p className="mt-6 w-[384px] text-center text-xs text-muted">
        By clicking continue, you agree to our{' '}
        <Link href="/terms" className="underline">Terms of Service</Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">Privacy Policy</Link>
      </p>
    </main>
  );
}