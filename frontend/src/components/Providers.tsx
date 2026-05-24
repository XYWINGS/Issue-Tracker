"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, type PaletteMode } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Provider } from "react-redux";
import { ColorModeContext, colorModeStorageKey } from "@/lib/colorMode";
import { store } from "@/lib/store";
import { createAppTheme } from "@/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>("light");

  useEffect(() => {
    const savedMode = window.localStorage.getItem(colorModeStorageKey);

    if (savedMode === "light" || savedMode === "dark") {
      setMode(savedMode);
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((currentMode) => {
          const nextMode = currentMode === "light" ? "dark" : "light";
          window.localStorage.setItem(colorModeStorageKey, nextMode);
          return nextMode;
        });
      }
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider>
      <Provider store={store}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            {children}
          </ThemeProvider>
        </ColorModeContext.Provider>
      </Provider>
    </AppRouterCacheProvider>
  );
}
