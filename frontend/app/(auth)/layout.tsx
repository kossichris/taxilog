export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
