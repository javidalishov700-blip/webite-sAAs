import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/landing/ambient-background";

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

export const dynamic = "force-dynamic";

function reasonKey(reason?: string): "missing" | "paused" | "banned" | "unpublished" {
  if (reason === "paused" || reason === "banned" || reason === "unpublished") return reason;
  return "missing";
}

export default async function QrClosedPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const t = await getTranslations("pages.qrClosed");
  const reason = reasonKey(query.reason);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <AmbientBackground />
      <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">{t(reason)}</p>
      <Button variant="glow" className="mt-6" asChild>
        <Link href="/">{t("home")}</Link>
      </Button>
    </div>
  );
}
