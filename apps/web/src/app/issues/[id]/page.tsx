"use client";

import type { CreateIssueInput, Issue, UpdateIssueInput } from "@issue-tracker/shared";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IssueFormDialog } from "@/components/IssueFormDialog";
import { PriorityChip } from "@/components/PriorityChip";
import { SeverityChip } from "@/components/SeverityChip";
import { StatusChip } from "@/components/StatusChip";
import {
  useDeleteIssueMutation,
  useGetIssueQuery,
  useGetMeQuery,
  useUpdateIssueMutation,
  useUpdateIssueStatusMutation
} from "@/lib/api";

type ConfirmAction = "delete" | "resolve" | "close";

function confirmText(action: ConfirmAction, issue: Issue) {
  if (action === "delete") {
    return {
      title: "Delete issue",
      description: `Delete "${issue.title}" permanently?`,
      confirmLabel: "Delete",
      destructive: true
    };
  }

  if (action === "close") {
    return {
      title: "Close issue",
      description: `Close "${issue.title}"?`,
      confirmLabel: "Close",
      destructive: false
    };
  }

  return {
    title: "Resolve issue",
    description: `Mark "${issue.title}" as resolved?`,
    confirmLabel: "Resolve",
    destructive: false
  };
}

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const { data: issue, isError, isFetching } = useGetIssueQuery(params.id);
  const [updateIssue, updateState] = useUpdateIssueMutation();
  const [updateIssueStatus, statusState] = useUpdateIssueStatusMutation();
  const [deleteIssue, deleteState] = useDeleteIssueMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [error, setError] = useState("");

  const isOwner = issue?.createdBy.id === me?.user.id;

  async function handleUpdate(input: CreateIssueInput | UpdateIssueInput) {
    if (!issue) return;
    setError("");

    try {
      await updateIssue({ id: issue.id, body: input as UpdateIssueInput }).unwrap();
      setEditOpen(false);
    } catch {
      setError("The issue could not be saved.");
    }
  }

  async function handleConfirm() {
    if (!issue || !confirm) return;
    setError("");

    try {
      if (confirm === "delete") {
        await deleteIssue(issue.id).unwrap();
        router.replace("/issues");
        return;
      }

      await updateIssueStatus({
        id: issue.id,
        status: confirm === "close" ? "Closed" : "Resolved"
      }).unwrap();
      setConfirm(null);
    } catch {
      setError("The issue could not be updated.");
    }
  }

  const selectedConfirm = issue && confirm ? confirmText(confirm, issue) : null;

  return (
    <AuthGuard>
      <AppShell>
        <Stack spacing={3}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/issues")} sx={{ alignSelf: "flex-start" }}>
            Back to issues
          </Button>

          {isFetching ? (
            <Stack alignItems="center" minHeight={320} justifyContent="center">
              <CircularProgress />
            </Stack>
          ) : null}

          {isError ? <Alert severity="error">Issue not found.</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          {issue ? (
            <Paper sx={{ p: { xs: 2.5, md: 4 } }} variant="outlined">
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography variant="h4">{issue.title}</Typography>
                    <Typography color="text.secondary">
                      Created by {issue.createdBy.name} on {new Date(issue.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <StatusChip status={issue.status} />
                    <PriorityChip priority={issue.priority} />
                    <SeverityChip severity={issue.severity} />
                  </Stack>
                </Stack>

                <Divider />

                <Typography sx={{ whiteSpace: "pre-wrap" }}>{issue.description}</Typography>

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  {isOwner ? (
                    <>
                      <Button startIcon={<EditIcon />} onClick={() => setEditOpen(true)} variant="outlined">
                        Edit
                      </Button>
                      {issue.status !== "Resolved" ? (
                        <Button startIcon={<CheckCircleIcon />} onClick={() => setConfirm("resolve")} variant="outlined">
                          Resolve
                        </Button>
                      ) : null}
                      {issue.status !== "Closed" ? (
                        <Button startIcon={<CloseIcon />} onClick={() => setConfirm("close")} variant="outlined">
                          Close
                        </Button>
                      ) : null}
                      <Button color="error" startIcon={<DeleteIcon />} onClick={() => setConfirm("delete")} variant="outlined">
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Alert severity="info" sx={{ width: "100%" }}>
                      Only the creator can edit, close, resolve, or delete this issue.
                    </Alert>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ) : null}
        </Stack>

        {issue ? (
          <IssueFormDialog
            issue={issue}
            loading={updateState.isLoading}
            onClose={() => setEditOpen(false)}
            onSubmit={handleUpdate}
            open={editOpen}
          />
        ) : null}

        {selectedConfirm ? (
          <ConfirmDialog
            confirmLabel={selectedConfirm.confirmLabel}
            description={selectedConfirm.description}
            destructive={selectedConfirm.destructive}
            loading={deleteState.isLoading || statusState.isLoading}
            onClose={() => setConfirm(null)}
            onConfirm={handleConfirm}
            open={Boolean(confirm)}
            title={selectedConfirm.title}
          />
        ) : null}
      </AppShell>
    </AuthGuard>
  );
}
