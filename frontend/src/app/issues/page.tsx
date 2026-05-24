"use client";

import {
  ISSUE_PRIORITIES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  type CreateIssueInput,
  type Issue,
  type IssueListQuery,
  type IssueStatus,
  type UpdateIssueInput,
} from "@/lib/domain";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import LockIcon from "@mui/icons-material/Lock";
import PendingIcon from "@mui/icons-material/Pending";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import {
  DataGrid,
  GridOverlay,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
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
  useUpdateIssueStatusMutation,
} from "@/lib/api";
import { downloadBlob } from "@/utils/download";

type ConfirmAction = "delete" | "resolve" | "close";

const statusCardMeta = {
  Open: {
    icon: ErrorOutlineIcon,
    accent: "#f97316",
    caption: "Needs triage",
  },
  "In Progress": {
    icon: PendingIcon,
    accent: "#2563eb",
    caption: "Actively moving",
  },
  Resolved: {
    icon: CheckCircleIcon,
    accent: "#10b981",
    caption: "Ready to verify",
  },
  Closed: {
    icon: LockIcon,
    accent: "#64748b",
    caption: "Finished work",
  },
} satisfies Record<
  IssueStatus,
  {
    icon: typeof ErrorOutlineIcon;
    accent: string;
    caption: string;
  }
>;

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
      destructive: true,
    };
  }

  if (action === "close") {
    return {
      title: "Close issue",
      description: `Close "${issue.title}"?`,
      confirmLabel: "Close",
      destructive: false,
    };
  }

  return {
    title: "Resolve issue",
    description: `Mark "${issue.title}" as resolved?`,
    confirmLabel: "Resolve",
    destructive: false,
  };
}

function IssuesEmptyOverlay({
  hasActiveFilters,
}: {
  hasActiveFilters: boolean;
}) {
  return (
    <GridOverlay>
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{
          height: "100%",
          maxWidth: 360,
          mx: "auto",
          px: 3,
          textAlign: "center",
        }}
      >
        <Box
          sx={(theme) => ({
            alignItems: "center",
            border: `1px solid ${alpha(
              theme.palette.primary.main,
              theme.palette.mode === "dark" ? 0.38 : 0.24,
            )}`,
            borderRadius: 3,
            display: "flex",
            height: 84,
            justifyContent: "center",
            position: "relative",
            width: 112,
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(145deg, ${alpha(
                    theme.palette.primary.main,
                    0.18,
                  )}, ${alpha(theme.palette.background.paper, 0.92)})`
                : `linear-gradient(145deg, ${alpha(
                    theme.palette.primary.main,
                    0.12,
                  )}, ${theme.palette.background.paper})`,
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 18px 42px ${alpha("#000", 0.28)}`
                : `0 18px 42px ${alpha("#0f172a", 0.1)}`,
            overflow: "hidden",
            "@keyframes emptyIconFloat": {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(-4px)" },
            },
            "@keyframes emptyBarSlide": {
              "0%": { transform: "translateX(-22%)", opacity: 0.45 },
              "50%": { transform: "translateX(18%)", opacity: 1 },
              "100%": { transform: "translateX(-22%)", opacity: 0.45 },
            },
          })}
        >
          <Stack spacing={0.75} sx={{ position: "absolute", inset: 12 }}>
            {[0, 1, 2].map((item) => (
              <Box
                key={item}
                sx={(theme) => ({
                  height: 7,
                  width: item === 1 ? "72%" : "88%",
                  borderRadius: 999,
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.24 : 0.16,
                  ),
                  animation: `emptyBarSlide 2.4s ease-in-out ${item * 0.22}s infinite`,
                })}
              />
            ))}
          </Stack>
          <Box
            sx={(theme) => ({
              alignItems: "center",
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "50%",
              color: theme.palette.primary.main,
              display: "flex",
              height: 44,
              justifyContent: "center",
              width: 44,
              zIndex: 1,
              animation: "emptyIconFloat 2.8s ease-in-out infinite",
            })}
          >
            <SearchOffIcon fontSize="small" />
          </Box>
        </Box>
        <Box>
          <Typography fontWeight={800} variant="h6">
            {hasActiveFilters ? "No matching issues" : "No issues yet"}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {hasActiveFilters
              ? "No issues found with the current filters. Try adjusting or clearing your filters?"
              : "Create the first issue to start tracking work."}
          </Typography>
        </Box>
      </Stack>
    </GridOverlay>
  );
}

export default function IssuesPage() {
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<IssueListQuery["status"]>("");
  const [priority, setPriority] = useState<IssueListQuery["priority"]>("");
  const [severity, setSeverity] = useState<IssueListQuery["severity"]>("");
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [formIssue, setFormIssue] = useState<Issue | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [confirm, setConfirm] = useState<{
    action: ConfirmAction;
    issue: Issue;
  } | null>(null);
  const [error, setError] = useState("");
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const exportMenuOpen = Boolean(exportAnchorEl);
  const hasActiveFilters = Boolean(search || status || priority || severity);

  const query = useMemo<IssueListQuery>(
    () => ({
      search: debouncedSearch,
      status,
      priority,
      severity,
      page: pagination.page + 1,
      limit: pagination.pageSize,
    }),
    [
      debouncedSearch,
      pagination.page,
      pagination.pageSize,
      priority,
      severity,
      status,
    ],
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
        await updateIssue({
          id: formIssue.id,
          body: input as UpdateIssueInput,
        }).unwrap();
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
          status: confirm.action === "close" ? "Closed" : "Resolved",
        }).unwrap();
      }
      setConfirm(null);
    } catch {
      setError("The issue could not be updated.");
    }
  }

  async function handleExport(format: "csv" | "json") {
    setExportAnchorEl(null);
    setError("");
    try {
      const blob = await exportIssues({
        ...query,
        page: undefined,
        limit: undefined,
        format,
      }).unwrap();
      downloadBlob(blob, `issues.${format}`);
    } catch {
      setError("The export could not be prepared.");
    }
  }

  function handleClearFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
    setSeverity("");
    setPagination((current) => ({ ...current, page: 0 }));
  }

  const noRowsOverlay = useMemo(() => {
    function NoRowsOverlay() {
      return <IssuesEmptyOverlay hasActiveFilters={hasActiveFilters} />;
    }

    return NoRowsOverlay;
  }, [hasActiveFilters]);

  const columns = useMemo<GridColDef<Issue>[]>(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1,
        minWidth: 240,
        renderCell: ({ row }) => (
          <Button
            onClick={() => router.push(`/issues/${row.id}`)}
            sx={{ justifyContent: "flex-start", px: 0 }}
          >
            {row.title}
          </Button>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 150,
        renderCell: ({ row }) => <StatusChip status={row.status} />,
      },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 130,
        renderCell: ({ row }) => <PriorityChip priority={row.priority} />,
      },
      {
        field: "severity",
        headerName: "Severity",
        minWidth: 130,
        renderCell: ({ row }) => <SeverityChip severity={row.severity} />,
      },
      {
        field: "createdBy",
        headerName: "Owner",
        minWidth: 170,
        valueGetter: (_value, row) => row.createdBy.name,
      },
      {
        field: "createdAt",
        headerName: "Created",
        minWidth: 150,
        valueGetter: (_value, row) =>
          new Date(row.createdAt).toLocaleDateString(),
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
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              height="100%"
            >
              <Tooltip title="View">
                <IconButton
                  aria-label="View issue"
                  onClick={() => router.push(`/issues/${row.id}`)}
                  size="small"
                >
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
                        onClick={() =>
                          setConfirm({ action: "resolve", issue: row })
                        }
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
                        onClick={() =>
                          setConfirm({ action: "close", issue: row })
                        }
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
                      onClick={() =>
                        setConfirm({ action: "delete", issue: row })
                      }
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : null}
            </Stack>
          );
        },
      },
    ],
    [me?.user.id, router],
  );

  const confirmText = confirm
    ? getIssueActionText(confirm.action, confirm.issue)
    : null;

  return (
    <AuthGuard>
      <AppShell>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h4">Issues</Typography>
              <Typography color="text.secondary">
                Track, filter, resolve, and export team issues.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                aria-controls={exportMenuOpen ? "export-menu" : undefined}
                aria-expanded={exportMenuOpen ? "true" : undefined}
                aria-haspopup="true"
                disabled={exportState.isFetching}
                startIcon={<DownloadIcon />}
                variant="outlined"
                onClick={(event) => setExportAnchorEl(event.currentTarget)}
                sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}
              >
                Export
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                id="export-menu"
                onClose={() => setExportAnchorEl(null)}
                open={exportMenuOpen}
              >
                <MenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </MenuItem>
                <MenuItem onClick={() => handleExport("json")}>
                  Export as JSON
                </MenuItem>
              </Menu>
              <Button
                startIcon={<AddIcon />}
                sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}
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
              <Paper
                key={item}
                sx={(theme) => {
                  const meta = statusCardMeta[item as IssueStatus];

                  return {
                    flex: 1,
                    overflow: "hidden",
                    p: 2.5,
                    position: "relative",
                    background: `linear-gradient(135deg, ${alpha(
                      meta.accent,
                      theme.palette.mode === "dark" ? 0.18 : 0.1,
                    )}, ${theme.palette.background.paper} 72%)`,
                    borderColor: alpha(
                      meta.accent,
                      theme.palette.mode === "dark" ? 0.42 : 0.22,
                    ),
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 18px 48px rgba(0, 0, 0, 0.2)"
                        : "0 14px 34px rgba(15, 23, 42, 0.06)",
                  };
                }}
                variant="outlined"
              >
                {(() => {
                  const meta = statusCardMeta[item as IssueStatus];
                  const StatusCardIcon = meta.icon;

                  return (
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography
                          color="text.secondary"
                          fontWeight={700}
                          variant="body2"
                        >
                          {item}
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight={800}
                          lineHeight={1.1}
                          sx={{ mt: 0.5 }}
                        >
                          {stats?.[item as IssueStatus] ?? 0}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          {meta.caption}
                        </Typography>
                      </Box>
                      <Box
                        sx={(theme) => ({
                          alignItems: "center",
                          bgcolor: alpha(
                            meta.accent,
                            theme.palette.mode === "dark" ? 0.22 : 0.14,
                          ),
                          border: `1px solid ${alpha(meta.accent, theme.palette.mode === "dark" ? 0.45 : 0.24)}`,
                          borderRadius: 2,
                          color: meta.accent,
                          display: "flex",
                          height: 42,
                          justifyContent: "center",
                          width: 42,
                        })}
                      >
                        <StatusCardIcon fontSize="small" />
                      </Box>
                    </Stack>
                  );
                })()}
              </Paper>
            ))}
          </Stack>

          <Paper sx={{ p: 2 }} variant="outlined">
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", lg: "center" }}
              justifyContent="space-between"
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                flexWrap="wrap"
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <FormControl
                  sx={{ minWidth: 180, width: { xs: "100%", md: 180 } }}
                >
                  <InputLabel id="status-filter" shrink>
                    Status
                  </InputLabel>
                  <Select
                    displayEmpty
                    label="Status"
                    labelId="status-filter"
                    renderValue={(selected) =>
                      selected ? String(selected) : "All statuses"
                    }
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as IssueListQuery["status"])
                    }
                  >
                    <MenuItem value="">All statuses</MenuItem>
                    {ISSUE_STATUSES.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{ minWidth: 180, width: { xs: "100%", md: 180 } }}
                >
                  <InputLabel id="priority-filter" shrink>
                    Priority
                  </InputLabel>
                  <Select
                    displayEmpty
                    label="Priority"
                    labelId="priority-filter"
                    renderValue={(selected) =>
                      selected ? String(selected) : "All priorities"
                    }
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target.value as IssueListQuery["priority"],
                      )
                    }
                  >
                    <MenuItem value="">All priorities</MenuItem>
                    {ISSUE_PRIORITIES.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{ minWidth: 180, width: { xs: "100%", md: 180 } }}
                >
                  <InputLabel id="severity-filter" shrink>
                    Severity
                  </InputLabel>
                  <Select
                    displayEmpty
                    label="Severity"
                    labelId="severity-filter"
                    renderValue={(selected) =>
                      selected ? String(selected) : "All severities"
                    }
                    value={severity}
                    onChange={(event) =>
                      setSeverity(
                        event.target.value as IssueListQuery["severity"],
                      )
                    }
                  >
                    <MenuItem value="">All severities</MenuItem>
                    {ISSUE_SEVERITIES.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="Clear filters">
                  <span>
                    <IconButton
                      aria-label="Clear filters"
                      disabled={!hasActiveFilters}
                      onClick={handleClearFilters}
                      size="small"
                      sx={{
                        alignSelf: { xs: "flex-start", md: "center" },
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        height: 40,
                        width: 40,
                      }}
                    >
                      <FilterAltOffIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
                label="Search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search issues"
                value={search}
                sx={{ ml: { lg: "auto" }, width: { xs: "100%", lg: 360 } }}
              />
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
              slots={{
                noRowsOverlay,
                noResultsOverlay: noRowsOverlay,
              }}
              sx={(theme) => ({
                border: 0,
                "--DataGrid-rowBorderColor": theme.palette.divider,
                "& .MuiDataGrid-cell": {
                  borderColor: theme.palette.divider,
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 700,
                },
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "#f8fafc",
                  borderColor: theme.palette.divider,
                },
                "& .MuiDataGrid-footerContainer": {
                  borderColor: theme.palette.divider,
                },
                "& .MuiDataGrid-row:hover": {
                  bgcolor: theme.palette.action.hover,
                },
              })}
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
