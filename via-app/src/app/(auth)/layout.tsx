// NECESSITY: The auth layout provides a clean, centered container for authentication pages
// (login, register, forgot password). It does NOT include the Header/navbar because
// unauthenticated users shouldn't see dashboard navigation. The gradient background
// matches the Figma auth page design.
// LOGIC: This layout wraps the (auth) route group. It applies a minimal layout with
// centered content and a subtle green-tinted background from the Figma design.
// EDGE-CASE: Without this layout, auth pages would inherit the root layout, which is fine,
// but having a dedicated layout allows us to customize auth pages independently.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7faf7]">
      {children}
    </div>
  );
}
