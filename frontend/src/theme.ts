import { createTheme, type PaletteMode } from "@mui/material/styles";

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#60a5fa" : "#2563eb"
      },
      secondary: {
        main: isDark ? "#2dd4bf" : "#0f766e"
      },
      background: {
        default: isDark ? "#0f172a" : "#f7f8fb",
        paper: isDark ? "#111827" : "#ffffff"
      },
      divider: isDark ? "rgba(148, 163, 184, 0.24)" : "rgba(0, 0, 0, 0.12)",
      text: {
        primary: isDark ? "#f8fafc" : "rgba(0, 0, 0, 0.87)",
        secondary: isDark ? "#cbd5e1" : "rgba(0, 0, 0, 0.6)"
      },
      success: {
        main: isDark ? "#22c55e" : "#15803d"
      },
      warning: {
        main: isDark ? "#f59e0b" : "#b45309"
      },
      error: {
        main: isDark ? "#f87171" : "#b91c1c"
      },
      action: {
        hover: isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(0, 0, 0, 0.04)",
        selected: isDark ? "rgba(96, 165, 250, 0.18)" : "rgba(37, 99, 235, 0.08)"
      }
    },
    shape: {
      borderRadius: 8
    },
    typography: {
      fontFamily: "Inter, Arial, sans-serif",
      h4: {
        fontWeight: 700
      },
      h5: {
        fontWeight: 700
      },
      h6: {
        fontWeight: 700
      },
      button: {
        textTransform: "none",
        fontWeight: 700
      }
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true
        }
      },
      MuiTextField: {
        defaultProps: {
          size: "small"
        }
      },
      MuiSelect: {
        defaultProps: {
          size: "small"
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700
          }
        }
      }
    }
  });
}
