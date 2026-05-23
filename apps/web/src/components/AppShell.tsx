"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import BugReportIcon from "@mui/icons-material/BugReport";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { api, useGetMeQuery, useLogoutMutation } from "@/lib/api";
import { useAppDispatch } from "@/lib/hooks";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data } = useGetMeQuery();
  const [logout, { isLoading }] = useLogoutMutation();

  async function handleLogout() {
    await logout().unwrap();
    dispatch(api.util.resetApiState());
    router.replace("/login");
  }

  const initials =
    data?.user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <Box minHeight="100vh">
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
            <BugReportIcon color="primary" />
            <Typography variant="h6">Issue Tracker</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: 14 }}>{initials}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={700}>
                {data?.user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.user.email}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <span>
                <Button
                  color="inherit"
                  disabled={isLoading}
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  variant="outlined"
                >
                  Logout
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
}
