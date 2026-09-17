import { useTranslations } from "next-intl";
import { youtubeEmbedUrl } from "@/lib/video";
import { cn } from "@/lib/utils";

const TUTORIAL_VIDEO = "/istifade-qaydasi.mp4";
const TUTORIAL_POSTER = "/istifade-qaydasi.jpg";

/**
 * The walkthrough, shown on both the home page and the guide page. The env var
 * wins once the same recording is on YouTube; until then the bundled file
 * plays, so neither page needs setup to work.
 */
export function TutorialPlayer({ className }: { className?: string }) {
  const t = useTranslations("pages.guide");
  const videoUrl = youtubeEmbedUrl(process.env.NEXT_PUBLIC_TUTORIAL_VIDEO_URL);

  return (
    <div
      className={cn(
        "glow-ring overflow-hidden rounded-3xl border border-border/80 bg-[#07070f] shadow-2xl",
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
          src={TUTORIAL_VIDEO}
          poster={TUTORIAL_POSTER}
          title={t("videoTitle")}
          controls
          playsInline
          preload="none"
          className="block w-full bg-[#07070f]"
        />
      )}
    </div>
  );
}
