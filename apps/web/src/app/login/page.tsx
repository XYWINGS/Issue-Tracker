"use client";

import BugReportIcon from "@mui/icons-material/BugReport";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useLoginMutation } from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    return data?.message ?? "Unable to sign in.";
  }

  return "Unable to sign in.";
}

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password }).unwrap();
      router.replace("/issues");
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    }
  }

  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        py: 4
      }}
    >
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, width: "100%", maxWidth: 430 }} variant="outlined">
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <BugReportIcon color="primary" />
            <Typography variant="h5">Sign in</Typography>
          </Stack>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            autoComplete="email"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
            fullWidth
          />
          <TextField
            autoComplete="current-password"
            label="Password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
            fullWidth
          />
          <Button disabled={isLoading} size="large" type="submit" variant="contained">
            Sign in
          </Button>
          <Typography color="text.secondary" textAlign="center" variant="body2">
            New here?{" "}
            <Link component={NextLink} href="/register" fontWeight={700}>
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
