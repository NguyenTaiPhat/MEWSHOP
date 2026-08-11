"use client";

export function BackgroundAmbient() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: -1,
        overflow: "hidden",
      }}
    >
      {/* Radial Orbs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "15%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--bg-orb-1) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "-5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--bg-orb-2) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(70px)",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "30%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--bg-orb-3) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)",
          opacity: 0.6,
        }}
      />

      {/* Technical Grid Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(var(--bg-grid-pattern) 1px, transparent 1px), linear-gradient(90deg, var(--bg-grid-pattern) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.9,
        }}
      />
    </div>
  );
}
