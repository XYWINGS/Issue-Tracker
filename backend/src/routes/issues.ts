import {
  ISSUE_PRIORITIES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  type IssueListQuery,
  type IssueStats
} from "../domain.js";
import { Router } from "express";
import mongoose, { type FilterQuery } from "mongoose";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { Issue, type IssueDocument } from "../models/Issue.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { issuesToCsv } from "../utils/csv.js";
import { HttpError } from "../utils/httpError.js";
import { toIssueDto } from "../utils/issueDto.js";

const router = Router();
const { Types } = mongoose;

const createIssueSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(5000),
  priority: z.enum(ISSUE_PRIORITIES).default("Medium"),
  severity: z.enum(ISSUE_SEVERITIES).default("Minor")
});

const updateIssueSchema = createIssueSchema
  .partial()
  .extend({
    status: z.enum(ISSUE_STATUSES).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

const statusSchema = z.object({
  status: z.enum(ISSUE_STATUSES)
});

const querySchema = z.object({
  search: z.string().trim().max(160).optional().catch(undefined),
  status: z.union([z.enum(ISSUE_STATUSES), z.literal("")]).optional().catch(undefined),
  priority: z.union([z.enum(ISSUE_PRIORITIES), z.literal("")]).optional().catch(undefined),
  severity: z.union([z.enum(ISSUE_SEVERITIES), z.literal("")]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(1),
  limit: z.coerce.number().int().min(1).max(100).optional().catch(10)
});

const exportQuerySchema = querySchema.extend({
  format: z.enum(["csv", "json"]).optional().catch("csv")
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildIssueFilter(query: IssueListQuery): FilterQuery<IssueDocument> {
  const filter: FilterQuery<IssueDocument> = {};

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.severity) filter.severity = query.severity;

  return filter;
}

async function findIssueById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(404, "Issue not found.");
  }

  const issue = await Issue.findById(id).populate("createdBy", "name email");

  if (!issue) {
    throw new HttpError(404, "Issue not found.");
  }

  return issue;
}

function ensureOwner(issue: IssueDocument, userId?: string) {
  if (!userId || issue.createdBy._id.toString() !== userId) {
    throw new HttpError(403, "Only the issue creator can change this issue.");
  }
}

router.use(authenticate);

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const counts = await Issue.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = ISSUE_STATUSES.reduce(
      (acc, status) => ({
        ...acc,
        [status]: counts.find((item) => item._id === status)?.count ?? 0
      }),
      {} as IssueStats
    );

    res.json(stats);
  })
);

router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const query = exportQuerySchema.parse(req.query);
    const issues = await Issue.find(buildIssueFilter(query))
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    const data = issues.map(toIssueDto);

    if (query.format === "json") {
      res.setHeader("Content-Disposition", "attachment; filename=\"issues.json\"");
      res.json(data);
      return;
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"issues.csv\"");
    res.send(issuesToCsv(data));
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = querySchema.parse(req.query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter = buildIssueFilter(query);
    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Issue.countDocuments(filter)
    ]);

    res.json({
      data: issues.map(toIssueDto),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createIssueSchema.parse(req.body);
    const issue = await Issue.create({
      ...input,
      createdBy: req.user?.id
    });
    await issue.populate("createdBy", "name email");

    res.status(201).json(toIssueDto(issue));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const issue = await findIssueById(req.params.id);
    res.json(toIssueDto(issue));
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = updateIssueSchema.parse(req.body);
    const issue = await findIssueById(req.params.id);
    ensureOwner(issue, req.user?.id);

    issue.set(input);
    await issue.save();
    await issue.populate("createdBy", "name email");

    res.json(toIssueDto(issue));
  })
);

router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const input = statusSchema.parse(req.body);
    const issue = await findIssueById(req.params.id);
    ensureOwner(issue, req.user?.id);

    issue.status = input.status;
    await issue.save();
    await issue.populate("createdBy", "name email");

    res.json(toIssueDto(issue));
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const issue = await findIssueById(req.params.id);
    ensureOwner(issue, req.user?.id);
    await issue.deleteOne();

    res.status(204).send();
  })
);

export { router as issuesRouter };
