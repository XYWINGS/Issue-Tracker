"use client";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGetMeQuery } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isError, isLoading, isSuccess } = useGetMeQuery();

  useEffect(() => {
    if (isError) {
      router.replace("/login");
    }
  }, [isError, router]);

  if (isLoading || !isSuccess) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="100vh" spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Loading workspace</Typography>
      </Stack>
    );
  }

  return <>{children}</>;
}
