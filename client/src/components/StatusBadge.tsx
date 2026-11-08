const labels = { DRAFT: "Draft", PUBLISHED: "Published", CLOSED: "Closed" } as const;

export function StatusBadge({ status }: { status: keyof typeof labels }) {
  return <span className={"cp-badge cp-badge-" + status.toLowerCase()}>{labels[status]}</span>;
}
