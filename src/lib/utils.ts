export function formatVND(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Chờ duyệt",
    CONFIRMED: "Đã xác nhận",
    ACTIVE: "Đang thuê",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    AVAILABLE: "Sẵn sàng",
    RENTED: "Đang cho thuê",
    MAINTENANCE: "Bảo trì",
    OPEN: "Còn trống",
    BOOKED: "Đã đặt",
    BLOCKED: "Khóa slot",
    PAID: "Đã thanh toán",
    REFUNDED: "Đã hoàn cọc",
    REJECTED: "Bị từ chối",
    DEPOSIT: "Đặt cọc",
    PAYMENT: "Thanh toán",
    REFUND: "Hoàn tiền",
  };
  return labels[status] || status;
}

export function getStatusVariant(status: string): "default" | "success" | "warning" | "danger" | "info" | "accent" {
  const variants: Record<string, "default" | "success" | "warning" | "danger" | "info" | "accent"> = {
    PENDING: "warning",
    CONFIRMED: "info",
    ACTIVE: "accent",
    COMPLETED: "success",
    CANCELLED: "danger",
    AVAILABLE: "success",
    RENTED: "accent",
    MAINTENANCE: "warning",
    OPEN: "success",
    BOOKED: "danger",
    BLOCKED: "default",
    PAID: "success",
    REFUNDED: "info",
    REJECTED: "danger",
  };
  return variants[status] || "default";
}

export function getAvatarUrl(identifier?: string | null): string {
  if (!identifier) identifier = "Mew User";
  
  if (identifier.startsWith("http://") || identifier.startsWith("https://") || identifier.startsWith("data:image/")) {
    return identifier;
  }

  const cleanName = identifier.replace(/@.*/, "").trim();
  const initial = (cleanName.charAt(0) || "M").toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d97706"/><stop offset="100%" stop-color="%23b45309"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="url(%23bgG)" stroke="%23fef08a" stroke-width="2"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="44" font-family="system-ui, sans-serif" font-weight="800" fill="%23ffffff">${initial}</text></svg>`;

  return `data:image/svg+xml;utf8,${svg}`;
}

export function parseSpecs(specsInput: any): Record<string, string> {
  if (!specsInput) return {};
  let current = specsInput;
  let attempts = 0;
  while (typeof current === "string" && attempts < 5) {
    attempts++;
    try {
      const parsed = JSON.parse(current);
      current = parsed;
    } catch {
      break;
    }
  }
  if (typeof current === "object" && current !== null && !Array.isArray(current)) {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(current)) {
      if (k && v !== undefined && v !== null) {
        result[k] = String(v);
      }
    }
    return result;
  }
  return {};
}




