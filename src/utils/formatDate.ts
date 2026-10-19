export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const datePart = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

export function timeAgo(iso: string): string {
  const elapsedMinutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);

  if (elapsedMinutes < 1) return 'just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} ${elapsedHours === 1 ? 'hour' : 'hours'} ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays} ${elapsedDays === 1 ? 'day' : 'days'} ago`;

  return formatDateTime(iso);
}

export function isEdited(createdAt: string, updatedAt: string): boolean {
  return Math.abs(new Date(updatedAt).getTime() - new Date(createdAt).getTime()) > 60_000;
}
