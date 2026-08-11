"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="admin-page-title" style={{ marginBottom: "24px" }}>Nhật ký hệ thống</h1>

      {loading ? (
        <div className="skeleton" style={{ height: "200px" }} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>ID Đối tượng</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    Chưa có nhật ký nào ghi nhận
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.createdAt)}</td>
                    <td>{log.user?.name || log.userId}</td>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>{log.action}</td>
                    <td>{log.targetType}</td>
                    <td>{log.targetId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
