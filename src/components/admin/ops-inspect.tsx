"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ExternalLink, QrCode } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { catalogPath, qrGoPath } from "@/lib/catalog-url";
import type { OpsInspect } from "@/lib/ops-types";

function Photo({ src, alt }: { src: string; alt: string }) {
  return (
    // Admin moderation: remote + /api/media URLs, skip next/image domain config.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="size-24 rounded-xl object-cover ring-1 ring-border/70" />
  );
}

export function OpsInspectView({ data }: { data: OpsInspect }) {
  const t = useTranslations("admin.opsInspect");
  const itemTotal = data.categories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={data.name}
        subtitle={t("subtitle", { slug: data.slug })}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/ops">
                <ArrowLeft className="size-4" />
                {t("back")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={catalogPath(data.slug)} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                {t("openCatalog")}
              </a>
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Badge variant={data.bannedAt ? "destructive" : data.isPublished ? "success" : "muted"}>
          {data.bannedAt ? t("banned") : data.isPublished ? t("live") : t("hidden")}
        </Badge>
        <Badge variant="outline">{data.plan}</Badge>
        <Badge variant="outline">{data.industry}</Badge>
        <Badge variant="outline">{t("counts", { items: itemTotal, qrs: data.qrCodes.length })}</Badge>
      </div>

      {data.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.coverUrl} alt="" className="mb-5 h-40 w-full rounded-2xl object-cover" />
      ) : null}

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>{t("profile")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[auto_1fr]">
          {data.logoUrl ? <Photo src={data.logoUrl} alt={data.name} /> : null}
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">{t("owners")}</dt>
              <dd>
                {data.owners.map((owner) => (
                  <p key={owner.email}>
                    {owner.name} · {owner.email}{" "}
                    {owner.emailVerified ? t("verified") : t("unverified")}
                  </p>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t("contact")}</dt>
              <dd>
                {data.phone || data.address || data.website ? (
                  <>
                    {data.phone ? <p>{data.phone}</p> : null}
                    {data.address ? <p>{data.address}</p> : null}
                    {data.website ? <p className="break-all">{data.website}</p> : null}
                  </>
                ) : (
                  <p className="text-muted-foreground">{t("empty")}</p>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">{t("description")}</dt>
              <dd className="whitespace-pre-wrap">{data.description || t("empty")}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="size-4" />
            {t("qrs")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.qrCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noQrs")}</p>
          ) : (
            data.qrCodes.map((qr) => (
              <div key={qr.id} className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{qr.name}</span>
                  <Badge variant={qr.isActive ? "success" : "muted"}>{qr.isActive ? t("qrOn") : t("qrOff")}</Badge>
                  <span className="text-xs text-muted-foreground">{t("scans", { count: qr.scans })}</span>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{qr.targetUrl}</p>
                <a className="mt-1 inline-block text-xs text-primary hover:underline" href={qrGoPath(qr.id)} target="_blank" rel="noreferrer">
                  {t("openQr")}
                </a>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {data.categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noCatalog")}</p>
      ) : (
        data.categories.map((category) => (
          <Card key={category.id} className="mb-5">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {category.name}
                {!category.isVisible ? <Badge variant="muted">{t("hidden")}</Badge> : null}
                <span className="text-sm font-normal text-muted-foreground">
                  {t("itemCount", { count: category.items.length })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noItems")}</p>
              ) : (
                category.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border/70 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.price} {item.currency}
                          {item.isFeatured ? ` · ${t("featured")}` : ""}
                          {!item.isVisible ? ` · ${t("hidden")}` : ""}
                        </p>
                      </div>
                    </div>
                    {item.description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{item.description}</p>
                    ) : null}
                    {item.images.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.images.map((src) => (
                          <a key={src} href={src} target="_blank" rel="noreferrer">
                            <Photo src={src} alt={item.title} />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">{t("noPhotos")}</p>
                    )}
                    {item.attributes.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {item.attributes.map((attribute) => (
                          <li key={`${attribute.key}-${attribute.value}`}>
                            <span className="font-medium text-foreground/80">{attribute.key}:</span> {attribute.value}
                            {attribute.unit ? ` ${attribute.unit}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
