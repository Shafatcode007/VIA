/* NECESSITY: Single source of truth for module availability + role access */
/* LOGIC: Navbar and dashboard consume this config. No hardcoded disabled/Coming Soon in components */
/* EDGE-CASE: null/undefined role returns false for all modules */

export type UserRole = 'RESIDENT' | 'LANDLORD' | 'SELLER' | 'DRIVER' | 'ADMIN';

export type ModuleKey = 'HOUSING' | 'GROCERY' | 'TRANSPORT' | 'SELLER_HUB' | 'ADMIN_PANEL';

export interface ModuleRule {
  key: ModuleKey;
  label: string;
  href: string;
  released: boolean;
  allowedRoles: UserRole[];
}

const ALL_ROLES: UserRole[] = ['RESIDENT', 'LANDLORD', 'SELLER', 'DRIVER', 'ADMIN'];

export const MODULE_RULES: ModuleRule[] = [
  { key: 'HOUSING', label: 'Housing', href: '/rentals', released: true, allowedRoles: ALL_ROLES },
  { key: 'GROCERY', label: 'Grocery', href: '/grocery', released: true, allowedRoles: ALL_ROLES },
  { key: 'TRANSPORT', label: 'Transport', href: '/transport', released: false, allowedRoles: ALL_ROLES },
  { key: 'SELLER_HUB', label: 'Manage My Products', href: '/seller/products', released: true, allowedRoles: ['SELLER'] },
  { key: 'ADMIN_PANEL', label: 'View Orders & Ledger', href: '/admin/orders', released: true, allowedRoles: ['ADMIN'] },
];

/* NECESSITY: Check if a role can access a module */
/* LOGIC: Returns false for null/undefined role (guest) */
/* EDGE-CASE: Unknown role returns false */
export function canAccessModule(role: UserRole | null | undefined, key: ModuleKey): boolean {
  if (!role) return false;
  const rule = MODULE_RULES.find((r) => r.key === key);
  return Boolean(rule && rule.released && rule.allowedRoles.includes(role));
}

export interface NavItem {
  key: ModuleKey;
  label: string;
  href: string;
  enabled: boolean;
  comingSoon: boolean;
}

/* NECESSITY: Top-navbar module links shown to every logged-in role */
/* LOGIC: Only HOUSING, GROCERY, TRANSPORT appear in top nav */
/* EDGE-CASE: Guest sees nothing (empty array) */
export function getNavbarItems(role: UserRole | null | undefined): NavItem[] {
  return MODULE_RULES
    .filter((r) => r.key === 'HOUSING' || r.key === 'GROCERY' || r.key === 'TRANSPORT')
    .map((r) => ({
      key: r.key,
      label: r.label,
      href: r.href,
      enabled: canAccessModule(role, r.key),
      comingSoon: !r.released,
    }));
}

/* NECESSITY: Dashboard quick actions, role-aware */
/* LOGIC: Always shows Housing + Grocery; SELLER gets Manage My Products; ADMIN gets View Orders */
/* EDGE-CASE: Guest sees Housing + Grocery but as disabled (comingSoon=true in parent) */
export function getQuickActions(role: UserRole | null | undefined): NavItem[] {
  const actions: NavItem[] = [
    {
      key: 'HOUSING',
      label: 'Find Housing',
      href: MODULE_RULES.find((r) => r.key === 'HOUSING')!.href,
      enabled: canAccessModule(role, 'HOUSING'),
      comingSoon: !MODULE_RULES.find((r) => r.key === 'HOUSING')!.released,
    },
    {
      key: 'GROCERY',
      label: 'Order Grocery',
      href: '/grocery',
      enabled: canAccessModule(role, 'GROCERY'),
      comingSoon: false,
    },
  ];
  if (role === 'SELLER') {
    actions.push({ key: 'SELLER_HUB', label: 'Manage My Products', href: '/seller/products', enabled: true, comingSoon: false });
  }
  if (role === 'ADMIN') {
    actions.push({ key: 'ADMIN_PANEL', label: 'View Orders & Ledger', href: '/admin/orders', enabled: true, comingSoon: false });
  }
  return actions;
}
