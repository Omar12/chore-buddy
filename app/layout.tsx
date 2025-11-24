import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chore Buddy - Family Chores & Rewards',
  description: 'A family-focused chores and rewards app to help parents assign chores to kids and track completion with a points system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
