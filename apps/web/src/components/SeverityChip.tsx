import type { IssueSeverity } from "@issue-tracker/shared";
import ReportIcon from "@mui/icons-material/Report";
import Chip from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";

const severityStyles: Record<
  IssueSeverity,
  {
    light: { bg: string; border: string; color: string };
    dark: { bg: string; border: string; color: string };
  }
> = {
  Minor: {
    light: { bg: "#fafafa", border: "#d4d4d8", color: "#52525b" },
    dark: { bg: "rgba(113, 113, 122, 0.2)", border: "#a1a1aa", color: "#e4e4e7" },
  },
  Major: {
    light: { bg: "#eef2ff", border: "#a5b4fc", color: "#4338ca" },
    dark: { bg: "rgba(99, 102, 241, 0.2)", border: "#818cf8", color: "#c7d2fe" },
  },
  Critical: {
    light: { bg: "#fff7ed", border: "#fdba74", color: "#c2410c" },
    dark: { bg: "rgba(249, 115, 22, 0.2)", border: "#fb923c", color: "#fed7aa" },
  },
  Blocker: {
    light: { bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c" },
    dark: { bg: "rgba(239, 68, 68, 0.2)", border: "#f87171", color: "#fecaca" },
  },
};

export function SeverityChip({ severity }: { severity: IssueSeverity }) {
  const chipSx: SxProps<Theme> = (theme) => {
    const colors = theme.palette.mode === "dark" ? severityStyles[severity].dark : severityStyles[severity].light;

    return {
      bgcolor: colors.bg,
      borderColor: colors.border,
      color: colors.color,
      "& .MuiChip-icon": {
        color: colors.color,
      },
    };
  };

  return <Chip icon={<ReportIcon />} label={severity} size="small" sx={chipSx} variant="outlined" />;
}
