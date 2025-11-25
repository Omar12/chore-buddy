import KidNav from '@/components/ui/KidNav';

export default function KidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <KidNav />
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
