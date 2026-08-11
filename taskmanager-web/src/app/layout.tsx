import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, ColorModeProvider } from '@/components/providers/theme-provider';

export const metadata: Metadata = {
  title: 'Pyramid — Task Management',
  description: 'Task Management System built for the AbleSpace assessment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning is required by next-themes: it sets the
    // `class` attribute on <html> before React hydrates, which would
    // otherwise trigger a (harmless but noisy) hydration warning.
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ColorModeProvider>{children}</ColorModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}