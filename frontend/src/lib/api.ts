import type {
  AuthResponse,
  CreateIssueInput,
  Issue,
  IssueListQuery,
  IssueStats,
  PaginatedIssues,
  UpdateIssueInput
} from "@/lib/domain";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function issueQueryParams(query: IssueListQuery & { format?: "csv" | "json" }) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include"
  }),
  tagTypes: ["Auth", "Issue", "IssueStats"],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body
      }),
      invalidatesTags: ["Auth"]
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body
      }),
      invalidatesTags: ["Auth"]
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      }),
      invalidatesTags: ["Auth", "Issue", "IssueStats"]
    }),
    getMe: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"]
    }),
    getIssues: builder.query<PaginatedIssues, IssueListQuery>({
      query: (query) => {
        const params = issueQueryParams(query);
        return `/issues${params ? `?${params}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((issue) => ({ type: "Issue" as const, id: issue.id })),
              { type: "Issue", id: "LIST" }
            ]
          : [{ type: "Issue", id: "LIST" }]
    }),
    getIssue: builder.query<Issue, string>({
      query: (id) => `/issues/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Issue", id }]
    }),
    getIssueStats: builder.query<IssueStats, void>({
      query: () => "/issues/stats",
      providesTags: ["IssueStats"]
    }),
    createIssue: builder.mutation<Issue, CreateIssueInput>({
      query: (body) => ({
        url: "/issues",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Issue", id: "LIST" }, "IssueStats"]
    }),
    updateIssue: builder.mutation<Issue, { id: string; body: UpdateIssueInput }>({
      query: ({ id, body }) => ({
        url: `/issues/${id}`,
        method: "PATCH",
        body
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Issue", id },
        { type: "Issue", id: "LIST" },
        "IssueStats"
      ]
    }),
    updateIssueStatus: builder.mutation<Issue, { id: string; status: Issue["status"] }>({
      query: ({ id, status }) => ({
        url: `/issues/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Issue", id },
        { type: "Issue", id: "LIST" },
        "IssueStats"
      ]
    }),
    deleteIssue: builder.mutation<void, string>({
      query: (id) => ({
        url: `/issues/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "Issue", id: "LIST" }, "IssueStats"]
    }),
    exportIssues: builder.query<Blob, IssueListQuery & { format: "csv" | "json" }>({
      query: (query) => {
        const params = issueQueryParams(query);
        return {
          url: `/issues/export${params ? `?${params}` : ""}`,
          responseHandler: (response) => response.blob()
        };
      }
    })
  })
});

export const {
  useCreateIssueMutation,
  useDeleteIssueMutation,
  useExportIssuesQuery,
  useGetIssueQuery,
  useGetIssuesQuery,
  useGetIssueStatsQuery,
  useGetMeQuery,
  useLazyExportIssuesQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateIssueMutation,
  useUpdateIssueStatusMutation
} = api;
