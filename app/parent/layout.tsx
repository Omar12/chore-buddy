import ParentNav from '@/components/ui/ParentNav';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ParentNav />
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
