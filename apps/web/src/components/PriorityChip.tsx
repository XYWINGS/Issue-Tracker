import type { IssuePriority } from "@issue-tracker/shared";
import FlagIcon from "@mui/icons-material/Flag";
import Chip from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";

const priorityStyles: Record<
  IssuePriority,
  {
    light: { bg: string; color: string };
    dark: { bg: string; color: string };
  }
> = {
  Low: {
    light: { bg: "#e2e8f0", color: "#334155" },
    dark: { bg: "#334155", color: "#f8fafc" },
  },
  Medium: {
    light: { bg: "#2563eb", color: "#ffffff" },
    dark: { bg: "#3b82f6", color: "#eff6ff" },
  },
  High: {
    light: { bg: "#f59e0b", color: "#422006" },
    dark: { bg: "#fbbf24", color: "#422006" },
  },
  Urgent: {
    light: { bg: "#e11d48", color: "#ffffff" },
    dark: { bg: "#fb7185", color: "#450a0a" },
  },
};

export function PriorityChip({ priority }: { priority: IssuePriority }) {
  const chipSx: SxProps<Theme> = (theme) => {
    const colors = theme.palette.mode === "dark" ? priorityStyles[priority].dark : priorityStyles[priority].light;

    return {
      bgcolor: colors.bg,
      color: colors.color,
      "& .MuiChip-icon": {
        color: colors.color,
      },
    };
  };

  return (
    <Chip icon={<FlagIcon />} label={priority} size="small" sx={chipSx} variant="filled" />
  );
}
