export const ISSUE_STATUSES = ["Open", "In Progress", "Resolved", "Closed"] as const;
export const ISSUE_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const ISSUE_SEVERITIES = ["Minor", "Major", "Critical", "Blocker"] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  createdBy: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface IssueListQuery {
  search?: string;
  status?: IssueStatus | "";
  priority?: IssuePriority | "";
  severity?: IssueSeverity | "";
  page?: number;
  limit?: number;
}

export interface PaginatedIssues {
  data: Issue[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type IssueStats = Record<IssueStatus, number>;

export interface CreateIssueInput {
  title: string;
  description: string;
  priority: IssuePriority;
  severity: IssueSeverity;
}

export type UpdateIssueInput = Partial<CreateIssueInput> & {
  status?: IssueStatus;
};

export type AuthUser = UserSummary;

export interface AuthResponse {
  user: AuthUser;
}
