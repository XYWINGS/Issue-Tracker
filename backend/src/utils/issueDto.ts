import type { Issue, UserSummary } from "../domain.js";
import type { Types } from "mongoose";
import type { IssueDocument } from "../models/Issue.js";

type PopulatedUser = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

function toUserSummary(user: PopulatedUser): UserSummary {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  };
}

export function toIssueDto(issue: IssueDocument): Issue {
  const createdBy = issue.createdBy as unknown as PopulatedUser;

  return {
    id: issue._id.toString(),
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    severity: issue.severity,
    createdBy: toUserSummary(createdBy),
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString()
  };
}
