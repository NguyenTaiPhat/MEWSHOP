"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [animKey, setAnimKey] = useState(pathname);

  useEffect(() => {
    setIsNavigating(true);
    setAnimKey(pathname);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div
        className={`page-nav-progress ${isNavigating ? "active" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #eab308 100%)",
          boxShadow: "0 0 14px rgba(217, 119, 6, 0.6)",
          zIndex: 9999,
          opacity: isNavigating ? 1 : 0,
          transform: isNavigating ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left center",
          transition: "transform 280ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease",
          pointerEvents: "none",
        }}
      />

      <style jsx global>{`
        @keyframes pageEntrance {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .page-transition-wrapper {
          animation: pageEntrance 320ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>

      <div key={animKey} className="page-transition-wrapper">
        {children}
      </div>
    </>
  );
}
