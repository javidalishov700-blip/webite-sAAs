import { useTranslations } from "next-intl";
import { BookOpen, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";
import { TutorialPlayer } from "@/components/landing/tutorial-player";

/**
 * The walkthrough on the home page itself: people who need it are the least
 * likely to go hunting for it in the footer.
 */
export function GuideTeaser() {
  const t = useTranslations("pages.guide");

  return (
    <section id="guide" className="relative mx-auto max-w-4xl scroll-mt-24 px-5 py-20 sm:px-6">
      <Reveal className="max-w-2xl">
        <h2 className="font-serif text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <Reveal className="mt-10">
        <TutorialPlayer />
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("videoNote")}</p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button variant="outline" asChild>
            <Link href="/c/live-demo">
              <Smartphone className="size-4" />
              {t("liveDemo")}
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/guide">
              <BookOpen className="size-4" />
              {t("allSteps")}
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
