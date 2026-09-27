import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`} dir="ltr">
      <span className="gradient-primary-bg inline-block size-7 rounded-lg glow" />
      <span className="gradient-text text-2xl font-extrabold tracking-[0.18em]">NEXORA</span>
    </Link>
  );
}
