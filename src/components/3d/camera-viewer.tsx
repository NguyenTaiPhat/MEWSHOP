"use client";

import dynamic from "next/dynamic";
import React, { Component, ReactNode } from "react";

const CameraCanvas = dynamic(() => import("./camera-canvas"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", minHeight: "450px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="skeleton" style={{ width: "80%", height: "300px", borderRadius: "16px" }} />
    </div>
  ),
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class Camera3DErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error("Camera 3D Chunk Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: "100%", height: "100%", minHeight: "450px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "24px", textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <rect x="2" y="6" width="20" height="14" rx="3" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Đang cập nhật xem 3D...</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="btn btn-secondary btn-sm"
          >
            Tải lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Camera3DViewer() {
  return (
    <Camera3DErrorBoundary>
      <CameraCanvas />
    </Camera3DErrorBoundary>
  );
}
