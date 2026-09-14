"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, ImageOff, MoreHorizontal, Package, Pencil, Plus, Search, Smartphone, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { useCreateItem, useDeleteItem, useDuplicateItem, useItems, useUpdateItem } from "@/hooks/use-items";
import { useCompany } from "@/hooks/use-company";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { usePlanLimitToast } from "@/hooks/use-plan-limit-toast";
import { PlanUsageBanner } from "@/components/admin/plan-usage-banner";
import { Link, useRouter } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";
import { ApiError, isPlanLimitError } from "@/lib/api-client";
import type { ItemWithAttributes } from "@/lib/data/types";
import type { ItemInput } from "@/lib/validators/item";

export default function ProductsPage() {
  const t = useTranslations("admin.products");
  const tCat = useTranslations("admin.categories");
  const tp = useTranslations("admin.preview");
  const tc = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: company } = useCompany();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: items, isLoading: itemsLoading } = useItems();
  const usage = usePlanUsage();
  const planToast = usePlanLimitToast();
  const createCategory = useCreateCategory();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const duplicateItem = useDuplicateItem();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemWithAttributes | null>(null);
  const [deletingItem, setDeletingItem] = useState<ItemWithAttributes | null>(null);
  const openedFromQuery = useRef(false);

  const isLoading = categoriesLoading || itemsLoading;
  const categorySuggestions =
    (tCat.raw(`suggestions.${company?.industry ?? "OTHER"}`) as string[] | undefined) ?? [];

  function openCreateProduct() {
    if (!usage.items.canAdd) {
      planToast.show("items", usage.items.limit);
      return;
    }
    setEditingItem(null);
    setFormOpen(true);
  }

  async function ensureCategory(name: string): Promise<string> {
    const existing = (categories ?? []).find(
      (category) => category.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (existing) return existing.id;
    if (!usage.categories.canAdd) {
      planToast.show("categories", usage.categories.limit);
      throw new ApiError("plan_limit", 403);
    }
    try {
      const created = await createCategory.mutateAsync({ name: name.trim() });
      if (!created?.id) throw new ApiError(tc("error"), 500);
      queryClient.setQueryData(queryKeys.categories, (current: typeof categories) => {
        const list = current ?? [];
        return list.some((row) => row.id === created.id) ? list : [...list, created];
      });
      setCategoryFilter(created.id);
      return created.id;
    } catch (err) {
      if (!planToast.fromError(err)) {
        toast.error(err instanceof ApiError ? err.message : tc("error"));
      }
      throw err;
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    if (categoryId) setCategoryFilter(categoryId);
  }, []);

  useEffect(() => {
    if (openedFromQuery.current || categoriesLoading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") !== "1") return;
    openedFromQuery.current = true;
    openCreateProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesLoading, categories]);

  const categoryById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories]);

  const filteredItems = useMemo(() => {
    return (items ?? []).filter((item) => {
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && item.categoryId !== categoryFilter) return false;
      if (statusFilter === "visible" && !item.isVisible) return false;
      if (statusFilter === "hidden" && item.isVisible) return false;
      return true;
    });
  }, [items, search, categoryFilter, statusFilter]);

  async function handleSubmit(values: ItemInput) {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...values });
        toast.success(t("updated"), {
          action: { label: tp("seeOnPhone"), onClick: () => router.push("/admin/preview") },
        });
      } else {
        await createItem.mutateAsync(values);
        toast.success(t("created"), {
          action: { label: tp("seeOnPhone"), onClick: () => router.push("/admin/preview") },
        });
      }
      setFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      if (planToast.fromError(err)) return;
      toast.error(err instanceof ApiError ? err.message : tc("error"));
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;
    await deleteItem.mutateAsync(deletingItem.id);
    toast.success(t("deleted"));
    setDeletingItem(null);
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <Button variant="glow" className="w-full sm:w-auto" onClick={openCreateProduct}>
              <Plus className="size-4" />
              {t("add")}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/admin/preview">
                <Smartphone className="size-4" />
                {tp("seeOnPhone")}
              </Link>
            </Button>
          </>
        }
      />

      <PlanUsageBanner />

      {!isLoading && (items?.length ?? 0) > 0 && (
        <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("searchPlaceholder")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatus")}</SelectItem>
              <SelectItem value="visible">{tc("visible")}</SelectItem>
              <SelectItem value="hidden">{tc("hidden")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : (items?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Package}
          title={t("emptyState")}
          action={
            <Button variant="glow" onClick={openCreateProduct}>
              <Plus className="size-4" />
              {t("add")}
            </Button>
          }
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState icon={Search} title={t("empty")} />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.item")}</TableHead>
                <TableHead>{t("table.category")}</TableHead>
                <TableHead>{t("table.price")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.images[0] ? (
                          <Image src={item.images[0]} alt="" fill unoptimized className="object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <ImageOff className="size-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium">
                          {item.title}
                          {item.isFeatured && <Star className="size-3.5 shrink-0 fill-warning text-warning" />}
                        </p>
                        {item.stockCount === 0 && (
                          <p className="text-xs text-destructive">{t("form.sizeOutOfStock")}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{categoryById.get(item.categoryId)?.name ?? "—"}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.price, item.currency)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => updateItem.mutate({ id: item.id, isVisible: !item.isVisible })}
                      className="inline-flex"
                    >
                      <Badge variant={item.isVisible ? "success" : "muted"} className="cursor-pointer gap-1">
                        {item.isVisible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        {item.isVisible ? tc("visible") : tc("hidden")}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditingItem(item);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                          {tc("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            if (!usage.items.canAdd) {
                              planToast.show("items", usage.items.limit);
                              return;
                            }
                            duplicateItem.mutate(item.id, {
                              onSuccess: () => toast.success(t("duplicated")),
                              onError: (err) => {
                                if (!isPlanLimitError(err)) toast.error(tc("error"));
                                else planToast.fromError(err);
                              },
                            });
                          }}
                        >
                          <Copy className="size-4" />
                          {t("duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeletingItem(item)}>
                          <Trash2 className="size-4" />
                          {tc("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="sticky bottom-4 z-20 mt-6 sm:hidden">
        <Button variant="glow" size="lg" className="w-full" onClick={openCreateProduct}>
          <Plus className="size-4" />
          {t("add")}
        </Button>
      </div>

      <Drawer
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        direction="right"
      >
        <DrawerContent showHandle={false} className="flex h-[100dvh] max-h-[100dvh] w-full max-w-xl flex-col sm:max-w-xl">
          <DrawerHeader className="shrink-0 border-b border-border/70 pb-4">
            <DrawerTitle>{editingItem ? t("form.titleEdit") : t("form.titleNew")}</DrawerTitle>
            <p className="text-sm text-muted-foreground">{t("form.categoryHint")}</p>
          </DrawerHeader>
          {company ? (
            <ProductForm
              key={editingItem?.id ?? `new-${categoryFilter}`}
              categories={categories ?? []}
              industry={company.industry}
              item={editingItem}
              defaultCategoryId={categoryFilter !== "all" ? categoryFilter : undefined}
              defaultCurrency={company.currency}
              suggestions={categorySuggestions}
              featuredLocked={!usage.canFeature}
              onFeaturedLocked={() => planToast.show("featured")}
              onEnsureCategory={ensureCategory}
              onSubmit={handleSubmit}
              onCancel={() => setFormOpen(false)}
              isSubmitting={createItem.isPending || updateItem.isPending || createCategory.isPending}
            />
          ) : (
            <div className="space-y-3 px-5 py-5">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirmDescription", { name: deletingItem?.title ?? "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{tc("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
