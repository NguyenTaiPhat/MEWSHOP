import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  );
}
