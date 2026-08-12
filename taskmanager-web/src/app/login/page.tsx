'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PyramidLogo } from '@/components/icons/pyramid-logo';
import { GoogleIcon } from '@/components/icons/google-icon';
import { guestLogin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuestLogin() {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await guestLogin();
      // Client-side storage for now — fine for a guest-only flow.
      // Swap for an httpOnly cookie once Google OAuth needs proper session handling.
      window.localStorage.setItem('accessToken', accessToken);
      router.push('/tasks'); // next screen we build — this route doesn't exist yet
    } catch {
      setError('Could not start a guest session. Is the API running on :4000?');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Logo row — 1200 Fill x 24 Hug per Figma, centered in the frame */}
      <div className="mb-8 flex items-center gap-2">
        <PyramidLogo className="h-6 w-6" />
        <span className="text-sm font-semibold text-foreground">Pyramid</span>
      </div>

      {/* Auth card — 384px wide, height hugs content, per Figma */}
      <div className="w-[384px] rounded-2xl border border-border bg-card p-8">
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

          {/* Google OAuth isn't built on the backend yet (Phase 1 = Guest
              only) — kept visible per the design, but genuinely disabled
              rather than wired to a fake handler. */}
          <button
            disabled
            title="Coming soon"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-medium text-foreground opacity-50"
          >
            <GoogleIcon />
            Login with Google
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-xs text-destructive">{error}</p>
        )}
      </div>

      {/* Footer legal text — 384 x 48 Hug per Figma */}
      <p className="mt-6 w-[384px] text-center text-xs text-muted">
        By clicking continue, you agree to our{' '}
        <Link href="/terms" className="underline">Terms of Service</Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">Privacy Policy</Link>
      </p>
    </main>
  );
}