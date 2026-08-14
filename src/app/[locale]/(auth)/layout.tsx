import { QrCode } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AmbientBackground } from "@/components/landing/ambient-background";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="glow-ring flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
            <QrCode className="size-4.5" />
          </span>
          QR-Universe
        </Link>
        <LanguageSwitcher variant="glass" />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}
