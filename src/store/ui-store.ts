import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));

interface CatalogUiState {
  activeCategoryId: string | null;
  searchQuery: string;
  activeItemId: string | null;
  localeSheetOpen: boolean;
  setActiveCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveItemId: (id: string | null) => void;
  setLocaleSheetOpen: (open: boolean) => void;
}

export const useCatalogUiStore = create<CatalogUiState>((set) => ({
  activeCategoryId: null,
  searchQuery: "",
  activeItemId: null,
  localeSheetOpen: false,
  setActiveCategoryId: (id) => set({ activeCategoryId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveItemId: (id) => set({ activeItemId: id }),
  setLocaleSheetOpen: (open) => set({ localeSheetOpen: open }),
}));
