"use client";

export interface RoleOption {
  value: string;
  label: string;
  hint: string;
}

export const PUBLIC_ROLES: RoleOption[] = [
  { value: "RESIDENT", label: "Resident", hint: "Browse housing, grocery & rides" },
  { value: "LANDLORD", label: "Landlord", hint: "List & manage properties" },
  { value: "SELLER", label: "Seller", hint: "Sell grocery products" },
  { value: "DRIVER", label: "Driver", hint: "Accept ride requests & earn" },
];

interface RoleSelectorProps {
  value: string;
  onChange: (role: string) => void;
}

/**
 * Public role picker for registration.
 * Admin is intentionally NOT selectable — admin accounts are seeded.
 */
export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PUBLIC_ROLES.map((role) => {
        const selected = role.value === value;
        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            aria-pressed={selected}
            className={`rounded-xl border p-3 text-left transition-all ${
              selected
                ? "border-[#4DBE55] bg-[#edf7ee] shadow-sm"
                : "border-gray-200 bg-white hover:border-[#4DBE55]/50"
            }`}
          >
            <span className="block text-sm font-semibold text-gray-900">{role.label}</span>
            <span className="mt-1 block text-xs text-gray-500">{role.hint}</span>
          </button>
        );
      })}
    </div>
  );
}