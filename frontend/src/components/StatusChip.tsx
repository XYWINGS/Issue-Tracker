import type { IssueStatus } from "@/lib/domain";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";
import LockIcon from "@mui/icons-material/Lock";
import PendingIcon from "@mui/icons-material/Pending";
import Chip from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";

const statusIcon: Record<IssueStatus, React.ReactElement> = {
  Open: <CircleIcon />,
  "In Progress": <PendingIcon />,
  Resolved: <CheckCircleIcon />,
  Closed: <LockIcon />,
};

const statusStyles: Record<
  IssueStatus,
  {
    light: { bg: string; border: string; color: string };
    dark: { bg: string; border: string; color: string };
  }
> = {
  Open: {
    light: { bg: "#fff7ed", border: "#fdba74", color: "#c2410c" },
    dark: { bg: "rgba(249, 115, 22, 0.18)", border: "#fb923c", color: "#fed7aa" },
  },
  "In Progress": {
    light: { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" },
    dark: { bg: "rgba(37, 99, 235, 0.2)", border: "#60a5fa", color: "#bfdbfe" },
  },
  Resolved: {
    light: { bg: "#ecfdf5", border: "#6ee7b7", color: "#047857" },
    dark: { bg: "rgba(16, 185, 129, 0.18)", border: "#34d399", color: "#a7f3d0" },
  },
  Closed: {
    light: { bg: "#f8fafc", border: "#cbd5e1", color: "#475569" },
    dark: { bg: "rgba(148, 163, 184, 0.16)", border: "#94a3b8", color: "#e2e8f0" },
  },
};

export function StatusChip({ status }: { status: IssueStatus }) {
  const chipSx: SxProps<Theme> = (theme) => {
    const colors = theme.palette.mode === "dark" ? statusStyles[status].dark : statusStyles[status].light;

    return {
      bgcolor: colors.bg,
      borderColor: colors.border,
      color: colors.color,
      "& .MuiChip-icon": {
        color: colors.color,
      },
    };
  };

  return <Chip icon={statusIcon[status]} label={status} size="small" sx={chipSx} variant="outlined" />;
}
