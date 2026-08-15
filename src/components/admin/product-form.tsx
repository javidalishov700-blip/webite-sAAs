"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Check, Star, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { AttributeEditor } from "@/components/admin/attribute-editor";
import {
  productFormSchema,
  type AttributeInput,
  type ItemInput,
  type ProductFormOutput,
  type ProductFormValues,
} from "@/lib/validators/item";
import { getCategoryIcon } from "@/lib/category-icons";
import { CURRENCIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category, Industry, ItemWithAttributes } from "@/lib/data/types";

interface ProductFormProps {
  categories: Category[];
  industry: Industry;
  item?: ItemWithAttributes | null;
  defaultCategoryId?: string;
  defaultCurrency: string;
  suggestions?: string[];
  featuredLocked?: boolean;
  onFeaturedLocked?: () => void;
  onEnsureCategory: (name: string) => Promise<string>;
  onSubmit: (values: ItemInput) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function initialCategory(categories: Category[], item?: ItemWithAttributes | null, defaultCategoryId?: string) {
  if (item) return categories.find((category) => category.id === item.categoryId);
  if (defaultCategoryId) return categories.find((category) => category.id === defaultCategoryId);
  return categories[0];
}

export function ProductForm({
  categories,
  industry,
  item,
  defaultCategoryId,
  defaultCurrency,
  suggestions = [],
  featuredLocked = false,
  onFeaturedLocked,
  onEnsureCategory,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProductFormProps) {
  const t = useTranslations("admin.products.form");
  const tc = useTranslations("common");
  const startingCategory = initialCategory(categories, item, defaultCategoryId);
  const [imageUrl, setImageUrl] = useState<string | null>(item?.images[0] ?? null);
  const [categoryDraft, setCategoryDraft] = useState(startingCategory?.name ?? "");
  const [categoryError, setCategoryError] = useState(false);
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
  } = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
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
          categoryId: startingCategory?.id ?? "",
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
  const categoryId = watch("categoryId");
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const unusedSuggestions = suggestions.filter(
    (name) => !categories.some((category) => category.name.toLowerCase() === name.toLowerCase()),
  );

  function applyCategoryName(name: string) {
    setCategoryDraft(name);
    setCategoryError(false);
    const match = categories.find((category) => category.name.trim().toLowerCase() === name.trim().toLowerCase());
    setValue("categoryId", match?.id ?? "", { shouldValidate: true });
  }

  function pickCategory(category: Category) {
    setCategoryDraft(category.name);
    setCategoryError(false);
    setValue("categoryId", category.id, { shouldValidate: true });
  }

  async function submit(values: ProductFormOutput) {
    try {
      const name = categoryDraft.trim();
      const match =
        categories.find((category) => category.id === values.categoryId) ??
        categories.find((category) => category.name.trim().toLowerCase() === name.toLowerCase());
      const nextCategoryId = match?.id ?? (name ? await onEnsureCategory(name) : "");
      if (!nextCategoryId) {
        setCategoryError(true);
        return;
      }
      const filledAttributes = attributes.filter((attr) => attr.key.trim().length > 0);
      return await onSubmit({
        ...values,
        categoryId: nextCategoryId,
        images: imageUrl ? [imageUrl] : [],
        attributes: filledAttributes,
      });
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
        <section className="space-y-3 rounded-2xl border border-primary/25 bg-primary/5 p-3.5">
          <div>
            <Label htmlFor="category-name" className="text-sm font-semibold">
              {t("categoryLabel")} *
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("categoryHint")}</p>
          </div>
          <Input
            id="category-name"
            value={categoryDraft}
            onChange={(event) => applyCategoryName(event.target.value)}
            placeholder={t("categoryPlaceholder")}
            className="h-12 bg-background text-base"
            autoComplete="off"
          />
          {unusedSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unusedSuggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => applyCategoryName(name)}
                  className="rounded-full border border-dashed border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
                >
                  + {name}
                </button>
              ))}
            </div>
          )}
          {categories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("categoryOrPick")}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t("categoryOrPick")}>
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.icon);
                  const selected = categoryId === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => pickCategory(category)}
                      className={cn(
                        "flex min-h-12 items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background hover:border-primary/50 hover:bg-primary/10",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{category.name}</span>
                      {selected ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {categoryDraft.trim() ? (
            <p className="text-sm font-medium text-primary">{t("categoryPicked", { name: categoryDraft.trim() })}</p>
          ) : categoryError ? (
            <p className="text-sm text-destructive">{t("categoryRequired")}</p>
          ) : null}
        </section>

        <section className="space-y-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("basics")}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[168px_1fr]">
            <ImageUpload value={imageUrl} onChange={setImageUrl} shape="photo" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">{t("titleLabel")}</Label>
                <Input id="title" placeholder={t("titlePlaceholder")} {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
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
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <Star className="size-4 text-muted-foreground" />
                {t("featuredLabel")}
              </span>
              {featuredLocked ? <span className="pl-7 text-xs text-muted-foreground">{t("featuredProHint")}</span> : null}
            </span>
            <Switch
              checked={isFeatured}
              onCheckedChange={(v) => {
                if (v && featuredLocked) {
                  onFeaturedLocked?.();
                  return;
                }
                setValue("isFeatured", v);
              }}
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("attributes")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("attributesHint")}</p>
          </div>
          <AttributeEditor industry={industry} categoryName={selectedCategory?.name} value={attributes} onChange={setAttributes} />
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
