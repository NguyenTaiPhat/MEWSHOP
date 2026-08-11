import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">{children}</main>
    </div>
  );
}
