import {
  ISSUE_PRIORITIES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  type IssuePriority,
  type IssueSeverity,
  type IssueStatus
} from "@issue-tracker/shared";
import mongoose, { type Document, type Types } from "mongoose";

const { Schema, model, models } = mongoose;

export interface IssueDocument extends Document {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IssueDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: "Open",
      index: true
    },
    priority: {
      type: String,
      enum: ISSUE_PRIORITIES,
      default: "Medium",
      index: true
    },
    severity: {
      type: String,
      enum: ISSUE_SEVERITIES,
      default: "Minor",
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

issueSchema.index({ title: "text", description: "text" });

export const Issue = models.Issue || model<IssueDocument>("Issue", issueSchema);
