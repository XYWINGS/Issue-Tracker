import type { IssueStatus } from "@issue-tracker/shared";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";
import LockIcon from "@mui/icons-material/Lock";
import PendingIcon from "@mui/icons-material/Pending";
import Chip from "@mui/material/Chip";

const statusColor: Record<IssueStatus, "default" | "info" | "success" | "warning"> = {
  Open: "warning",
  "In Progress": "info",
  Resolved: "success",
  Closed: "default"
};

const statusIcon: Record<IssueStatus, React.ReactElement> = {
  Open: <CircleIcon />,
  "In Progress": <PendingIcon />,
  Resolved: <CheckCircleIcon />,
  Closed: <LockIcon />
};

export function StatusChip({ status }: { status: IssueStatus }) {
  return <Chip color={statusColor[status]} icon={statusIcon[status]} label={status} size="small" variant="outlined" />;
}
