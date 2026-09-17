import { Phone, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { QrCode } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { SITE, telHref } from "@/lib/site";

export function SiteFooter() {
  const t = useTranslations("landing.footer");

  const columns = [
    {
      title: t("product"),
      links: [
        { label: t("howItWorks"), href: "/#how-it-works" },
        { label: t("guide"), href: "/guide" },
        { label: t("pricing"), href: "/#pricing" },
        { label: t("faq"), href: "/#faq" },
      ],
    },
    {
      title: t("company"),
      links: [
        { label: t("about"), href: "/about" },
        { label: t("contact"), href: "/contact" },
      ],
    },
    {
      title: t("legal"),
      links: [
        { label: t("privacy"), href: "/privacy" },
        { label: t("terms"), href: "/terms" },
        { label: t("cookies"), href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-border/70">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <RevealGroup className="grid grid-cols-2 gap-10 sm:grid-cols-4" stagger={0.08}>
          <RevealItem className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <QrCode className="size-4.5" />
              </span>
              QR-Universe
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t("description")}</p>
            <div className="mt-5 space-y-2 text-sm">
              <a href={telHref()} className="flex items-center gap-2 text-foreground hover:text-primary">
                <Phone className="size-4 text-primary" />
                {SITE.phoneDisplay}
              </a>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="size-4 text-accent" />
                WhatsApp
              </a>
            </div>
          </RevealItem>

          {columns.map((col) => (
            <RevealItem key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/#") ? (
                      <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} QR-Universe. {t("rights")}
          </p>
          <p>
            {t("reachUs")}{" "}
            <a href={telHref()} className="font-medium text-foreground hover:text-primary">
              {SITE.phoneDisplay}
            </a>
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
