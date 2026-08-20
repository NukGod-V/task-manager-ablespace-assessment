import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, ColorModeProvider } from '@/components/providers/theme-provider';

export const metadata: Metadata = {
  title: 'ClearStep | Task Management',
  description: 'Task Management System built for the AbleSpace assessment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ColorModeProvider>{children}</ColorModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}