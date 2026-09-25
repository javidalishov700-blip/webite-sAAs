import { useLocale, useTranslations } from "next-intl";
import { youtubeEmbedUrl } from "@/lib/video";
import { cn } from "@/lib/utils";

const RECORDINGS = {
  az: {
    src: "/istifade-qaydasi.mp4",
    poster: "/istifade-qaydasi.jpg",
    youtube: process.env.NEXT_PUBLIC_TUTORIAL_VIDEO_URL,
  },
  en: {
    src: "/tutorial-en.mp4",
    poster: "/tutorial-en.jpg",
    youtube: process.env.NEXT_PUBLIC_TUTORIAL_VIDEO_URL_EN,
  },
} as const;

/** Turkish readers follow the Azerbaijani screens; Russian readers get English. */
const RECORDING_FOR_LOCALE: Record<string, keyof typeof RECORDINGS> = { az: "az", tr: "az", en: "en", ru: "en" };

/**
 * The walkthrough, shown on both the home page and the guide page, recorded
 * once in Azerbaijani and once in English. A YouTube link in the env wins once
 * the same recording is uploaded; until then the bundled file plays.
 */
export function TutorialPlayer({ className }: { className?: string }) {
  const t = useTranslations("pages.guide");
  const recording = RECORDINGS[RECORDING_FOR_LOCALE[useLocale()] ?? "en"];
  const videoUrl = youtubeEmbedUrl(recording.youtube);

  return (
    <div
      className={cn(
        "glow-ring overflow-hidden rounded-3xl border border-border/80 bg-white shadow-2xl dark:bg-[#07070f]",
        className,
      )}
    >
      {videoUrl ? (
        <div className="relative aspect-video">
          <iframe
            src={videoUrl}
            title={t("videoTitle")}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 size-full"
          />
        </div>
      ) : (
        <video
          key={recording.src}
          src={recording.src}
          poster={recording.poster}
          title={t("videoTitle")}
          controls
          playsInline
          preload="none"
          className="block w-full bg-white dark:bg-[#07070f]"
        />
      )}
    </div>
  );
}
