import { ThemeSwitcherTest } from '@/components/theme-switcher-test';

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Pyramid — Design System Test</h1>
        <ThemeSwitcherTest />
      </div>
    </main>
  );
}