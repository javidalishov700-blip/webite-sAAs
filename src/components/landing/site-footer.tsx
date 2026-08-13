import { useTranslations } from "next-intl";
import { QrCode, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("landing.footer");

  const columns = [
    {
      title: t("product"),
      links: [
        { label: t("features"), href: "#features" },
        { label: t("useCases"), href: "#use-cases" },
        { label: t("demo"), href: "#demo" },
        { label: t("pricing"), href: "#pricing" },
      ],
    },
    {
      title: t("company"),
      links: [
        { label: t("about"), href: "#" },
        { label: t("careers"), href: "#" },
        { label: t("blog"), href: "#" },
        { label: t("contact"), href: "#" },
      ],
    },
    {
      title: t("legal"),
      links: [
        { label: t("privacy"), href: "#" },
        { label: t("terms"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-border/70">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <QrCode className="size-4.5" />
              </span>
              QR-Universe
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t("description")}</p>
            <div className="mt-5 flex items-center gap-3 text-muted-foreground">
              <a href="#" aria-label="GitHub" className="transition-colors hover:text-foreground">
                <Github className="size-4.5" />
              </a>
              <a href="#" aria-label="Twitter" className="transition-colors hover:text-foreground">
                <Twitter className="size-4.5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="transition-colors hover:text-foreground">
                <Linkedin className="size-4.5" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} QR-Universe. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
