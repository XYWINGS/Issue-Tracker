import type { Issue } from "@issue-tracker/shared";

const columns: Array<keyof Issue | "createdByName" | "createdByEmail"> = [
  "id",
  "title",
  "status",
  "priority",
  "severity",
  "createdByName",
  "createdByEmail",
  "createdAt",
  "updatedAt",
  "description"
];

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function issuesToCsv(issues: Issue[]) {
  const header = columns.join(",");
  const rows = issues.map((issue) =>
    columns
      .map((column) => {
        if (column === "createdByName") return escapeCsv(issue.createdBy.name);
        if (column === "createdByEmail") return escapeCsv(issue.createdBy.email);
        return escapeCsv(issue[column]);
      })
      .join(",")
  );

  return [header, ...rows].join("\n");
}
