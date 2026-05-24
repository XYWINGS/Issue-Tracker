"use client";

import { createContext, useContext } from "react";
import type { PaletteMode } from "@mui/material/styles";

export const colorModeStorageKey = "issue-tracker-color-mode";

export interface ColorModeContextValue {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export function useColorMode() {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error("useColorMode must be used within Providers.");
  }

  return context;
}
