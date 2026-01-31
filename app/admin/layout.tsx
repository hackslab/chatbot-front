import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <div className="pl-64 transition-all">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
