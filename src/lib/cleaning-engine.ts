export interface DealRecord {
  Deal_ID: string;
  Borrower_Name: string;
  Loan_Amount: number;
  Maturity_Date: string;
  Status: string;
}

export interface CleaningResult {
  cleanedData: DealRecord[];
  duplicatesRemoved: number;
  inactiveRemoved: number;
  originalCount: number;
}

export function cleanDataset(records: Record<string, string>[]): CleaningResult {
  const originalCount = records.length;

  // Standardize fields
  const standardized: DealRecord[] = records.map((r) => ({
    Deal_ID: (r.Deal_ID || r.deal_id || "").trim(),
    Borrower_Name: toTitleCase((r.Borrower_Name || r.borrower_name || "").trim()),
    Loan_Amount: parseFloat(String(r.Loan_Amount || r.loan_amount || "0").replace(/[^0-9.-]/g, "")) || 0,
    Maturity_Date: toISODate(r.Maturity_Date || r.maturity_date || ""),
    Status: (r.Status || r.status || "").trim(),
  }));

  // Drop duplicates by Deal_ID (keep first)
  const seen = new Set<string>();
  const deduped: DealRecord[] = [];
  let duplicatesRemoved = 0;
  for (const record of standardized) {
    if (seen.has(record.Deal_ID)) {
      duplicatesRemoved++;
    } else {
      seen.add(record.Deal_ID);
      deduped.push(record);
    }
  }

  // Remove inactive
  const active = deduped.filter((r) => r.Status.toLowerCase() === "active");
  const inactiveRemoved = deduped.length - active.length;

  return {
    cleanedData: active,
    duplicatesRemoved,
    inactiveRemoved,
    originalCount,
  };
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

function toISODate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().split("T")[0];
  } catch {
    return dateStr;
  }
}
