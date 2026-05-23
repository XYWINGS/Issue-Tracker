"use client";

import {
  ISSUE_PRIORITIES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  type CreateIssueInput,
  type Issue,
  type IssueListQuery,
  type IssueStatus,
  type UpdateIssueInput
} from "@issue-tracker/shared";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IssueFormDialog } from "@/components/IssueFormDialog";
import { PriorityChip } from "@/components/PriorityChip";
import { SeverityChip } from "@/components/SeverityChip";
import { StatusChip } from "@/components/StatusChip";
import {
  useCreateIssueMutation,
  useDeleteIssueMutation,
  useGetIssuesQuery,
  useGetIssueStatsQuery,
  useGetMeQuery,
  useLazyExportIssuesQuery,
  useUpdateIssueMutation,
  useUpdateIssueStatusMutation
} from "@/lib/api";
import { downloadBlob } from "@/utils/download";

type ConfirmAction = "delete" | "resolve" | "close";

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

function getIssueActionText(action: ConfirmAction, issue: Issue) {
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

export default function IssuesPage() {
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<IssueListQuery["status"]>("");
  const [priority, setPriority] = useState<IssueListQuery["priority"]>("");
  const [severity, setSeverity] = useState<IssueListQuery["severity"]>("");
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [formIssue, setFormIssue] = useState<Issue | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ action: ConfirmAction; issue: Issue } | null>(null);
  const [error, setError] = useState("");

  const query = useMemo<IssueListQuery>(
    () => ({
      search: debouncedSearch,
      status,
      priority,
      severity,
      page: pagination.page + 1,
      limit: pagination.pageSize
    }),
    [debouncedSearch, pagination.page, pagination.pageSize, priority, severity, status]
  );

  const { data: issues, isFetching } = useGetIssuesQuery(query);
  const { data: stats } = useGetIssueStatsQuery();
  const [createIssue, createState] = useCreateIssueMutation();
  const [updateIssue, updateState] = useUpdateIssueMutation();
  const [deleteIssue, deleteState] = useDeleteIssueMutation();
  const [updateIssueStatus, statusState] = useUpdateIssueStatusMutation();
  const [exportIssues, exportState] = useLazyExportIssuesQuery();

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 0 }));
  }, [debouncedSearch, priority, severity, status]);

  async function handleFormSubmit(input: CreateIssueInput | UpdateIssueInput) {
    setError("");
    try {
      if (formIssue) {
        await updateIssue({ id: formIssue.id, body: input as UpdateIssueInput }).unwrap();
      } else {
        await createIssue(input as CreateIssueInput).unwrap();
      }
      setFormOpen(false);
      setFormIssue(undefined);
    } catch {
      setError("The issue could not be saved.");
    }
  }

  async function handleConfirm() {
    if (!confirm) return;

    setError("");
    try {
      if (confirm.action === "delete") {
        await deleteIssue(confirm.issue.id).unwrap();
      } else {
        await updateIssueStatus({
          id: confirm.issue.id,
          status: confirm.action === "close" ? "Closed" : "Resolved"
        }).unwrap();
      }
      setConfirm(null);
    } catch {
      setError("The issue could not be updated.");
    }
  }

  async function handleExport(format: "csv" | "json") {
    setError("");
    try {
      const blob = await exportIssues({ ...query, page: undefined, limit: undefined, format }).unwrap();
      downloadBlob(blob, `issues.${format}`);
    } catch {
      setError("The export could not be prepared.");
    }
  }

  const columns = useMemo<GridColDef<Issue>[]>(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1,
        minWidth: 240,
        renderCell: ({ row }) => (
          <Button onClick={() => router.push(`/issues/${row.id}`)} sx={{ justifyContent: "flex-start", px: 0 }}>
            {row.title}
          </Button>
        )
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 150,
        renderCell: ({ row }) => <StatusChip status={row.status} />
      },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 130,
        renderCell: ({ row }) => <PriorityChip priority={row.priority} />
      },
      {
        field: "severity",
        headerName: "Severity",
        minWidth: 130,
        renderCell: ({ row }) => <SeverityChip severity={row.severity} />
      },
      {
        field: "createdBy",
        headerName: "Owner",
        minWidth: 170,
        valueGetter: (_value, row) => row.createdBy.name
      },
      {
        field: "createdAt",
        headerName: "Created",
        minWidth: 150,
        valueGetter: (_value, row) => new Date(row.createdAt).toLocaleDateString()
      },
      {
        field: "actions",
        headerName: "",
        width: 220,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          const isOwner = row.createdBy.id === me?.user.id;

          return (
            <Stack direction="row" spacing={0.5} alignItems="center" height="100%">
              <Tooltip title="View">
                <IconButton aria-label="View issue" onClick={() => router.push(`/issues/${row.id}`)} size="small">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {isOwner ? (
                <>
                  <Tooltip title="Edit">
                    <IconButton
                      aria-label="Edit issue"
                      onClick={() => {
                        setFormIssue(row);
                        setFormOpen(true);
                      }}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {row.status !== "Resolved" ? (
                    <Tooltip title="Resolve">
                      <IconButton
                        aria-label="Resolve issue"
                        onClick={() => setConfirm({ action: "resolve", issue: row })}
                        size="small"
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  {row.status !== "Closed" ? (
                    <Tooltip title="Close">
                      <IconButton
                        aria-label="Close issue"
                        onClick={() => setConfirm({ action: "close", issue: row })}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  <Tooltip title="Delete">
                    <IconButton
                      aria-label="Delete issue"
                      color="error"
                      onClick={() => setConfirm({ action: "delete", issue: row })}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : null}
            </Stack>
          );
        }
      }
    ],
    [me?.user.id, router]
  );

  const confirmText = confirm ? getIssueActionText(confirm.action, confirm.issue) : null;

  return (
    <AuthGuard>
      <AppShell>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4">Issues</Typography>
              <Typography color="text.secondary">Track, filter, resolve, and export team issues.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => handleExport("csv")}>
                CSV
              </Button>
              <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => handleExport("json")}>
                JSON
              </Button>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => {
                  setFormIssue(undefined);
                  setFormOpen(true);
                }}
              >
                New issue
              </Button>
            </Stack>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {ISSUE_STATUSES.map((item) => (
              <Paper key={item} sx={{ flex: 1, p: 2.25 }} variant="outlined">
                <Typography color="text.secondary" variant="body2">
                  {item}
                </Typography>
                <Typography variant="h4">{stats?.[item as IssueStatus] ?? 0}</Typography>
              </Paper>
            ))}
          </Stack>

          <Paper sx={{ p: 2 }} variant="outlined">
            <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                label="Search"
                onChange={(event) => setSearch(event.target.value)}
                value={search}
                sx={{ minWidth: { lg: 340 } }}
              />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="status-filter">Status</InputLabel>
                <Select
                  label="Status"
                  labelId="status-filter"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as IssueListQuery["status"])}
                >
                  <MenuItem value="">All statuses</MenuItem>
                  {ISSUE_STATUSES.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="priority-filter">Priority</InputLabel>
                <Select
                  label="Priority"
                  labelId="priority-filter"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as IssueListQuery["priority"])}
                >
                  <MenuItem value="">All priorities</MenuItem>
                  {ISSUE_PRIORITIES.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="severity-filter">Severity</InputLabel>
                <Select
                  label="Severity"
                  labelId="severity-filter"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value as IssueListQuery["severity"])}
                >
                  <MenuItem value="">All severities</MenuItem>
                  {ISSUE_SEVERITIES.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          <Paper sx={{ height: 620, width: "100%" }} variant="outlined">
            <DataGrid
              columns={columns}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              loading={isFetching || exportState.isFetching}
              onPaginationModelChange={setPagination}
              pageSizeOptions={[10, 25, 50]}
              paginationMode="server"
              paginationModel={pagination}
              rowCount={issues?.meta.total ?? 0}
              rows={issues?.data ?? []}
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "background.default"
                }
              }}
            />
          </Paper>
        </Stack>

        <IssueFormDialog
          issue={formIssue}
          loading={createState.isLoading || updateState.isLoading}
          onClose={() => {
            setFormOpen(false);
            setFormIssue(undefined);
          }}
          onSubmit={handleFormSubmit}
          open={formOpen}
        />

        {confirmText ? (
          <ConfirmDialog
            confirmLabel={confirmText.confirmLabel}
            description={confirmText.description}
            destructive={confirmText.destructive}
            loading={deleteState.isLoading || statusState.isLoading}
            onClose={() => setConfirm(null)}
            onConfirm={handleConfirm}
            open={Boolean(confirm)}
            title={confirmText.title}
          />
        ) : null}
      </AppShell>
    </AuthGuard>
  );
}
