import type { Viewport } from "next";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundAmbient } from "@/components/background-ambient";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ChatPopup } from "@/components/chat/chat-popup";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

export const metadata = {
  title: "Tiệm Của Mew - Cho thuê camera & thiết bị quay phim cao cấp",
  description: "Dịch vụ cho thuê máy ảnh, ống kính và thiết bị điện ảnh chuyên nghiệp hàng đầu.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <BackgroundAmbient />
          <SessionProvider>
            <PageTransition>{children}</PageTransition>
            <ChatPopup />
            <MobileBottomNav />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
