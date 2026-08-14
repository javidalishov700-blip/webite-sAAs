"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Star, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { AttributeEditor } from "@/components/admin/attribute-editor";
import { itemSchema, type AttributeInput, type ItemInput, type ItemFormValues } from "@/lib/validators/item";
import { CURRENCIES } from "@/lib/constants";
import type { Category, Industry, ItemWithAttributes } from "@/lib/data/types";

interface ProductFormProps {
  categories: Category[];
  industry: Industry;
  item?: ItemWithAttributes | null;
  defaultCategoryId?: string;
  defaultCurrency: string;
  onSubmit: (values: ItemInput) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProductForm({
  categories,
  industry,
  item,
  defaultCategoryId,
  defaultCurrency,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProductFormProps) {
  const t = useTranslations("admin.products.form");
  const tc = useTranslations("common");
  const [imageUrl, setImageUrl] = useState<string | null>(item?.images[0] ?? null);
  const [attributes, setAttributes] = useState<AttributeInput[]>(
    item?.attributes.map((a) => ({ key: a.key, value: a.value, type: a.type, unit: a.unit ?? "" })) ?? [],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemFormValues, unknown, ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: item
      ? {
          categoryId: item.categoryId,
          title: item.title,
          description: item.description ?? "",
          price: item.price,
          compareAtPrice: item.compareAtPrice ?? undefined,
          currency: item.currency,
          isVisible: item.isVisible,
          isFeatured: item.isFeatured,
          stockCount: item.stockCount ?? undefined,
          images: item.images,
          attributes: [],
        }
      : {
          categoryId: defaultCategoryId ?? categories[0]?.id ?? "",
          title: "",
          description: "",
          price: 0,
          currency: defaultCurrency,
          isVisible: true,
          isFeatured: false,
          images: [],
          attributes: [],
        },
  });

  useEffect(() => {
    setValue("images", imageUrl ? [imageUrl] : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const isVisible = watch("isVisible") ?? true;
  const isFeatured = watch("isFeatured") ?? false;

  function submit(values: ItemInput) {
    const filledAttributes = attributes.filter((attr) => attr.key.trim().length > 0);
    return onSubmit({ ...values, images: imageUrl ? [imageUrl] : [], attributes: filledAttributes });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex h-full flex-col">
      <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
        <section className="space-y-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("basics")}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[120px_1fr]">
            <ImageUpload value={imageUrl} onChange={setImageUrl} shape="square" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">{t("titleLabel")}</Label>
                <Input id="title" placeholder={t("titlePlaceholder")} {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">{t("categoryLabel")}</Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">{t("descriptionLabel")}</Label>
            <Textarea id="description" placeholder={t("descriptionPlaceholder")} rows={3} {...register("description")} />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("pricing")}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">{t("priceLabel")}</Label>
              <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compareAtPrice">{t("compareAtPriceLabel")}</Label>
              <Input id="compareAtPrice" type="number" step="0.01" min="0" {...register("compareAtPrice")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">{t("currencyLabel")}</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="max-w-[calc(33%-0.5rem)] space-y-1.5">
            <Label htmlFor="stockCount">{t("stockLabel")}</Label>
            <Input id="stockCount" type="number" min="0" placeholder={t("stockPlaceholder")} {...register("stockCount")} />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("visibility")}</p>
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/10 p-3.5">
            <span className="flex items-center gap-2.5 text-sm font-medium">
              <Eye className="size-4 text-muted-foreground" />
              {t("visibleLabel")}
            </span>
            <Switch checked={isVisible} onCheckedChange={(v) => setValue("isVisible", v)} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/10 p-3.5">
            <span className="flex items-center gap-2.5 text-sm font-medium">
              <Star className="size-4 text-muted-foreground" />
              {t("featuredLabel")}
            </span>
            <Switch checked={isFeatured} onCheckedChange={(v) => setValue("isFeatured", v)} />
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("attributes")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("attributesHint")}</p>
          </div>
          <AttributeEditor industry={industry} categoryName={categories.find((c) => c.id === watch("categoryId"))?.name} value={attributes} onChange={setAttributes} />
        </section>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border/70 px-5 py-4 sm:px-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tc("cancel")}
        </Button>
        <Button type="submit" variant="glow" loading={isSubmitting}>
          {item ? t("submitEdit") : t("submitCreate")}
        </Button>
      </div>
    </form>
  );
}
