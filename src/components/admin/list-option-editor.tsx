"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  cycleSizeOption,
  isSizeChoiceList,
  optionState,
  parseListOptions,
  serializeListOptions,
  sizeChipSet,
  suggestedSizeLabels,
  type ListOption,
} from "@/lib/list-options";

export function ListOptionEditor({
  attributeKey,
  value,
  onChange,
}: {
  attributeKey: string;
  value: string;
  onChange: (value: string) => void;
}) {
  if (sizeChipSet(attributeKey) || isSizeChoiceList(attributeKey, value)) {
    return <SizeChipPicker attributeKey={attributeKey} value={value} onChange={onChange} />;
  }
  return <ListChipInput value={value} onChange={onChange} />;
}

function SizeChipPicker({
  attributeKey,
  value,
  onChange,
}: {
  attributeKey: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("admin.products.form");
  const options = parseListOptions(value);
  const suggested = suggestedSizeLabels(attributeKey);
  const extras = options.filter(
    (option) => !suggested.some((label) => label.toLocaleLowerCase("az-AZ") === option.label.toLocaleLowerCase("az-AZ")),
  );
  const [custom, setCustom] = useState("");

  function commit(next: ListOption[]) {
    onChange(serializeListOptions(next));
  }

  function addCustom() {
    const label = custom.trim();
    if (!label) return;
    const exists = optionState(options, label) !== "off";
    commit(exists ? options : [...options, { label, available: true }]);
    setCustom("");
  }

  const groups =
    sizeChipSet(attributeKey) === "shoe"
      ? [suggested]
      : [suggested.slice(0, 9), suggested.slice(9)];

  return (
    <div className="min-w-0 space-y-2">
      <p className="text-[11px] leading-snug text-muted-foreground">{t("sizeTapHint")}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" />
          {t("sizeInStock")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          {t("sizeOutOfStock")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-dashed border-border" />
          {t("sizeNotOffered")}
        </span>
      </div>
      {groups
        .filter((group) => group.length > 0)
        .map((group, index) => (
        <div key={index} className="flex min-w-0 flex-wrap gap-1.5">
          {group.map((label) => (
            <SizeChipButton
              key={label}
              label={label}
              state={optionState(options, label)}
              onClick={() => commit(cycleSizeOption(options, label))}
            />
          ))}
        </div>
      ))}
      {extras.length > 0 ? (
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {extras.map((option) => (
            <SizeChipButton
              key={option.label}
              label={option.label}
              state={option.available ? "available" : "unavailable"}
              onClick={() => commit(cycleSizeOption(options, option.label))}
            />
          ))}
        </div>
      ) : null}
      <Input
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addCustom();
          }
        }}
        placeholder={t("sizeCustomPlaceholder")}
        className="h-9 min-w-0"
      />
    </div>
  );
}

function SizeChipButton({
  label,
  state,
  onClick,
}: {
  label: string;
  state: "off" | "available" | "unavailable";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 min-w-9 max-w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border px-2.5 text-xs font-semibold",
        state === "available" && "border-transparent bg-primary text-primary-foreground",
        state === "unavailable" && "border-border bg-muted/60 text-muted-foreground line-through",
        state === "off" && "border-dashed border-border bg-transparent text-muted-foreground",
      )}
    >
      <span className="max-w-[6.5rem] truncate">{label}</span>
    </button>
  );
}

function ListChipInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("admin.products.form");
  const options = parseListOptions(value);
  const [draft, setDraft] = useState("");

  function commit(next: ListOption[]) {
    onChange(serializeListOptions(next));
  }

  function addDraft() {
    const label = draft.trim().replace(/,$/, "");
    if (!label) return;
    if (optionState(options, label) === "off") commit([...options, { label, available: true }]);
    setDraft("");
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-[11px] text-muted-foreground">{t("listChipHint")}</p>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 overflow-hidden rounded-xl border border-input bg-input/30 p-1.5">
        {options.map((option) => (
          <span
            key={option.label}
            className="inline-flex max-w-full items-center gap-1 overflow-hidden rounded-lg bg-muted px-2 py-1 text-xs font-medium"
          >
            <span className="min-w-0 truncate">{option.label}</span>
            <button
              type="button"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => commit(options.filter((row) => row.label !== option.label))}
              aria-label={option.label}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            if (next.includes(",")) {
              const label = next.replace(/,/g, "").trim();
              if (label && optionState(options, label) === "off") commit([...options, { label, available: true }]);
              setDraft("");
              return;
            }
            setDraft(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
            if (e.key === "Backspace" && !draft && options.length > 0) {
              commit(options.slice(0, -1));
            }
          }}
          placeholder={options.length === 0 ? t("listChipPlaceholder") : ""}
          className="h-7 min-w-[7rem] flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
