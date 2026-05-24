/** Relative time helper — e.g. "just now", "5m ago", "2h ago", "3d ago" */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function generateQRCodeUrl(baseUrl: string, qrCodeId: string): string {
  return `${baseUrl}/s/${qrCodeId}`;
}

export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, "");
}

export function getCallLink(phone: string): string {
  return `tel:${formatPhone(phone)}`;
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = formatPhone(phone);
  const text = message
    ? encodeURIComponent(message)
    : encodeURIComponent("Hello! I found your car parked and wanted to reach you.");
  return `https://wa.me/${cleanPhone}?text=${text}`;
}
