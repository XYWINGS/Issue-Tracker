import type { IssueSeverity } from "@issue-tracker/shared";
import ReportIcon from "@mui/icons-material/Report";
import Chip from "@mui/material/Chip";

const colorBySeverity: Record<IssueSeverity, "default" | "info" | "warning" | "error"> = {
  Minor: "default",
  Major: "info",
  Critical: "warning",
  Blocker: "error"
};

export function SeverityChip({ severity }: { severity: IssueSeverity }) {
  return <Chip color={colorBySeverity[severity]} icon={<ReportIcon />} label={severity} size="small" variant="outlined" />;
}
