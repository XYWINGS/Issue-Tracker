"use client";

import {
  ISSUE_PRIORITIES,
  ISSUE_SEVERITIES,
  type CreateIssueInput,
  type Issue,
  type UpdateIssueInput
} from "@/lib/domain";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";

interface IssueFormDialogProps {
  open: boolean;
  issue?: Issue;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: CreateIssueInput | UpdateIssueInput) => Promise<void>;
}

const defaultForm: CreateIssueInput = {
  title: "",
  description: "",
  priority: "Medium",
  severity: "Minor"
};

export function IssueFormDialog({ open, issue, loading, onClose, onSubmit }: IssueFormDialogProps) {
  const [form, setForm] = useState<CreateIssueInput>(defaultForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (issue) {
      setForm({
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        severity: issue.severity
      });
    } else {
      setForm(defaultForm);
    }
    setError("");
  }, [issue, open]);

  async function handleSubmit() {
    if (form.title.trim().length < 3 || form.description.trim().length < 5) {
      setError("Title and description need a little more detail.");
      return;
    }

    await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim()
    });
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{issue ? "Edit issue" : "Create issue"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            inputProps={{ maxLength: 160 }}
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            inputProps={{ maxLength: 5000 }}
            minRows={5}
            multiline
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                label="Priority"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({ ...current, priority: event.target.value as CreateIssueInput["priority"] }))
                }
              >
                {ISSUE_PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="severity-label">Severity</InputLabel>
              <Select
                labelId="severity-label"
                label="Severity"
                value={form.severity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, severity: event.target.value as CreateIssueInput["severity"] }))
                }
              >
                {ISSUE_SEVERITIES.map((severity) => (
                  <MenuItem key={severity} value={severity}>
                    {severity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          {error ? <TextField error value={error} InputProps={{ readOnly: true }} fullWidth /> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} onClick={handleSubmit} variant="contained">
          {issue ? "Save changes" : "Create issue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
