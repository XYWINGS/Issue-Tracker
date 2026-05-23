import type { IssuePriority } from "@issue-tracker/shared";
import FlagIcon from "@mui/icons-material/Flag";
import Chip from "@mui/material/Chip";

const colorByPriority: Record<IssuePriority, "default" | "info" | "warning" | "error"> = {
  Low: "default",
  Medium: "info",
  High: "warning",
  Urgent: "error"
};

export function PriorityChip({ priority }: { priority: IssuePriority }) {
  return (
    <Chip color={colorByPriority[priority]} icon={<FlagIcon />} label={priority} size="small" variant="filled" />
  );
}
