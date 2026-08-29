// NECESSITY: Single source of truth for module availability + role access
// LOGIC: Navbar and dashboard consume this config. No hardcoded disabled/Coming Soon in components
// EDGE-CASE: null/undefined role returns false for all modules

export type UserRole = 'RESIDENT' | 'LANDLORD' | 'SELLER' | 'DRIVER' | 'ADMIN';

export type ModuleKey = 'HOUSING' | 'GROCERY' | 'TRANSPORT' | 'DRIVER_PANEL' | 'SELLER_HUB' | 'ADMIN_ANALYTICS' | 'ADMIN_USERS' | 'ADMIN_RENTALS';

export interface ModuleRule {
  key: ModuleKey;
  label: string;
  href: string;
  released: boolean;
  allowedRoles: UserRole[];
  /** Guests may browse this module without logging in. */
  publicBrowse: boolean;
}

const ALL_ROLES: UserRole[] = ['RESIDENT', 'LANDLORD', 'SELLER', 'DRIVER', 'ADMIN'];

export const MODULE_RULES: ModuleRule[] = [
  { key: 'HOUSING', label: 'Housing', href: '/properties', released: true, allowedRoles: ALL_ROLES, publicBrowse: true },
  { key: 'GROCERY', label: 'Grocery', href: '/grocery', released: true, allowedRoles: ALL_ROLES, publicBrowse: true },
  { key: 'TRANSPORT', label: 'Transport', href: '/transport', released: true, allowedRoles: ALL_ROLES, publicBrowse: false },
  { key: 'DRIVER_PANEL', label: 'Driver Panel', href: '/driver', released: true, allowedRoles: ['DRIVER'], publicBrowse: false },
  { key: 'SELLER_HUB', label: 'Manage My Products', href: '/seller/products', released: true, allowedRoles: ['SELLER'], publicBrowse: false },
  { key: 'ADMIN_ANALYTICS', label: 'Admin Analytics', href: '/admin/analytics', released: true, allowedRoles: ['ADMIN'], publicBrowse: false },
  { key: 'ADMIN_USERS', label: 'Manage Users', href: '/admin/users', released: true, allowedRoles: ['ADMIN'], publicBrowse: false },
  { key: 'ADMIN_RENTALS', label: 'Rental Listings', href: '/admin/rentals', released: true, allowedRoles: ['ADMIN'], publicBrowse: false },
];

const ROLE_ALIASES: Record<string, UserRole> = {
  RESIDENT: 'RESIDENT',
  LANDLORD: 'LANDLORD',
  SELLER: 'SELLER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
};

// NECESSITY: Case-insensitive role normalization ("seller" -> "SELLER")
// LOGIC: Backend stores roles in DB; frontend reads from JWT. Both must match.
// EDGE-CASE: Unknown role returns null
export function normalizeRole(raw: string | null | undefined): UserRole | null {
  if (!raw) return null;
  return ROLE_ALIASES[raw.trim().toUpperCase()] ?? null;
}

// NECESSITY: Check if a role can access a module
// LOGIC: Returns false for null/undefined role (guest)
// EDGE-CASE: Unknown role returns false
export function canAccessModule(rawRole: string | null | undefined, key: ModuleKey): boolean {
  const role = normalizeRole(rawRole);
  if (!role) return false;
  const rule = MODULE_RULES.find((r) => r.key === key);
  return Boolean(rule && rule.released && rule.allowedRoles.includes(role));
}

export interface NavItem {
  key: ModuleKey;
  label: string;
  href: string;
  loginHref: string;
  comingSoon: boolean;
  publicBrowse: boolean;
}

// NECESSITY: Top-navbar module links — released modules are ALWAYS clickable
// LOGIC: Public modules (HOUSING, GROCERY, TRANSPORT) visible to everyone.
// Role modules (DRIVER_PANEL, ADMIN_*) visible only to matching roles.
// Guests get loginHref redirect; logged-in users go straight to href.
// EDGE-CASE: Only unreleased modules render as inert text.
export function getNavbarItems(rawRole: string | null | undefined): NavItem[] {
  const role = normalizeRole(rawRole);
  const publicModules = MODULE_RULES.filter(
    (r) => r.key === 'HOUSING' || r.key === 'GROCERY' || r.key === 'TRANSPORT',
  );
  const roleModules = MODULE_RULES.filter(
    (r) => (r.key === 'DRIVER_PANEL' || r.key === 'ADMIN_ANALYTICS' || r.key === 'ADMIN_USERS' || r.key === 'ADMIN_RENTALS') && role !== null && r.allowedRoles.includes(role),
  );
  return [...publicModules, ...roleModules].map((r) => ({
    key: r.key,
    label: r.label,
    href: r.href,
    loginHref: `/login?next=${encodeURIComponent(r.href)}`,
    comingSoon: !r.released,
    publicBrowse: r.publicBrowse,
  }));
}

// NECESSITY: Dashboard quick actions, role-aware
// LOGIC: Always shows Housing + Grocery; SELLER gets Manage My Products; ADMIN gets Admin links
// EDGE-CASE: Guest sees Housing + Grocery with loginHref; role modules only for matching roles.
export function getQuickActions(rawRole: string | null | undefined): NavItem[] {
  const role = normalizeRole(rawRole);
  const actions: NavItem[] = [
    {
      key: 'HOUSING',
      label: 'Find Housing',
      href: MODULE_RULES.find((r) => r.key === 'HOUSING')!.href,
      loginHref: `/login?next=${encodeURIComponent(MODULE_RULES.find((r) => r.key === 'HOUSING')!.href)}`,
      comingSoon: !MODULE_RULES.find((r) => r.key === 'HOUSING')!.released,
      publicBrowse: true,
    },
    {
      key: 'GROCERY',
      label: 'Order Grocery',
      href: '/grocery',
      loginHref: '/login?next=%2Fgrocery',
      comingSoon: false,
      publicBrowse: true,
    },
    {
      key: 'TRANSPORT',
      label: 'Book a Ride',
      href: '/transport',
      loginHref: '/login?next=%2Ftransport',
      comingSoon: !MODULE_RULES.find((r) => r.key === 'TRANSPORT')!.released,
      publicBrowse: false,
    },
  ];
  if (role === 'SELLER') {
    actions.push({ key: 'SELLER_HUB', label: 'Manage My Products', href: '/seller/products', loginHref: '/login?next=%2Fseller%2Fproducts', comingSoon: false, publicBrowse: false });
  }
  if (role === 'ADMIN') {
    actions.push({ key: 'ADMIN_ANALYTICS', label: 'Admin Analytics', href: '/admin/analytics', loginHref: '/login?next=%2Fadmin%2Fanalytics', comingSoon: false, publicBrowse: false });
    actions.push({ key: 'ADMIN_USERS', label: 'Manage Users', href: '/admin/users', loginHref: '/login?next=%2Fadmin%2Fusers', comingSoon: false, publicBrowse: false });
    actions.push({ key: 'ADMIN_RENTALS', label: 'Rental Listings', href: '/admin/rentals', loginHref: '/login?next=%2Fadmin%2Frentals', comingSoon: false, publicBrowse: false });
  }
  if (role === 'DRIVER') {
    actions.push({ key: 'DRIVER_PANEL', label: 'Driver Panel', href: '/driver', loginHref: '/login?next=%2Fdriver', comingSoon: false, publicBrowse: false });
  }
  return actions;
}
