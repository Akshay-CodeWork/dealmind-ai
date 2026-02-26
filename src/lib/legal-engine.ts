export interface LegalExtraction {
  borrower_name: string;
  loan_amount: number;
  maturity_date: string;
  agreement_date: string;
  raw_text: string;
}

// Client-side mock legal extraction from PDF text
// In production this would call Groq + Pinecone
export function extractLegalFields(text: string): LegalExtraction {
  const borrowerMatch = text.match(
    /(?:borrower|party|company|entity)[:\s]*["']?([A-Z][A-Za-z\s&.,]+?)(?:["'\n,;(]|herein)/i
  );
  const amountMatch = text.match(
    /(?:loan|principal|amount|sum)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
  );
  const maturityMatch = text.match(
    /(?:maturity|expir(?:y|ation)|due)\s*(?:date)?[:\s]*([\w\s,]+?\d{4})/i
  );
  const agreementMatch = text.match(
    /(?:agreement|effective|dated|executed)\s*(?:date|on|as of)?[:\s]*([\w\s,]+?\d{4})/i
  );

  return {
    borrower_name: borrowerMatch?.[1]?.trim() || "Not Found",
    loan_amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0,
    maturity_date: parseDate(maturityMatch?.[1]?.trim() || ""),
    agreement_date: parseDate(agreementMatch?.[1]?.trim() || ""),
    raw_text: text.substring(0, 500),
  };
}

function parseDate(dateStr: string): string {
  if (!dateStr) return "Not Found";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().split("T")[0];
  } catch {
    return dateStr;
  }
}

export function generateExplanation(
  dealId: string,
  feData: { loan_amount: number; borrower_name: string; maturity_date: string },
  beData: { loan_amount: number; borrower_name: string; maturity_date: string }
): string {
  const parts: string[] = [];

  if (Math.abs(feData.loan_amount - beData.loan_amount) > 0.01) {
    const diff = Math.abs(feData.loan_amount - beData.loan_amount);
    parts.push(
      `Loan amount differs by ${diff.toLocaleString()}. Frontend shows ${feData.loan_amount.toLocaleString()} while backend shows ${beData.loan_amount.toLocaleString()}. This may indicate delayed synchronization or a manual override in the backend system.`
    );
  }

  if (feData.borrower_name.toLowerCase() !== beData.borrower_name.toLowerCase()) {
    parts.push(
      `Borrower name mismatch: "${feData.borrower_name}" vs "${beData.borrower_name}". This could be due to a legal name change, abbreviation differences, or data entry inconsistency.`
    );
  }

  if (feData.maturity_date !== beData.maturity_date) {
    parts.push(
      `Maturity date discrepancy: ${feData.maturity_date} vs ${beData.maturity_date}. This may result from a loan restructuring or amendment not reflected in both systems.`
    );
  }

  if (parts.length === 0) {
    return `Deal ${dealId}: No discrepancies detected between frontend and backend records.`;
  }

  return `Deal ${dealId}: ${parts.join(" ")}`;
}
