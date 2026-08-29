// NECESSITY: Temporary debug chip for runtime role verification
// LOGIC: Shows raw role, normalized role, and module access flags
// EDGE-CASE: Remove after user confirms Grocery is clickable

"use client";

import { canAccessModule, normalizeRole } from "@/lib/access/moduleAccess";

interface AccessDebugProps {
  rawRole: string | null | undefined;
}

export function AccessDebug({ rawRole }: AccessDebugProps) {
  const role = normalizeRole(rawRole);
  const flags = (['HOUSING', 'GROCERY', 'TRANSPORT'] as const).map(
    (key) => `${key}:${canAccessModule(rawRole, key) ? 'on' : 'off'}`,
  );

  return (
    <div className="mb-4 inline-flex flex-wrap items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-1 font-mono text-xs text-amber-800">
      <span>rawRole={String(rawRole)}</span>
      <span>normalized={String(role)}</span>
      {flags.map((f) => (
        <span key={f}>{f}</span>
      ))}
    </div>
  );
}
