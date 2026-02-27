export interface LegalExtraction {
  borrower_name: string;
  loan_amount: number;
  maturity_date: string;
  agreement_date: string;
  raw_text: string;
}

// Client-side mock legal extraction from PDF text
export function extractLegalFields(text: string): LegalExtraction {
  // 1. Normalize the messy PDF text (collapse multiple spaces and newlines into single spaces)
  const cleanText = text.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

  // 2. Ultra-forgiving Regexes
  // Looks for Borrower/Company/Party followed by caps, stopping at common separators
  const borrowerMatch = cleanText.match(/(?:borrower|party|company|entity)[\s:]*["']?([A-Z][a-zA-Z\s&.,]+?)(?:["',;(]| herein| is a| a | organized)/i);

  // Looks for any dollar amount over 1,000 to confidently catch the loan amount
  const amountMatch = cleanText.match(/(?:loan|principal|amount|sum|facility|commitment)[\s:]*(?:usd|\$)?\s*([\d,]{4,}(?:\.\d{2})?)/i) || cleanText.match(/\$\s*([\d,]{4,}(?:\.\d{2})?)/);

  // Looks for standard date formats near the words Maturity, Due, or Expiration
  const maturityMatch = cleanText.match(/(?:maturity|due|expiration)[\s]*(?:date)?[\s:]*([a-zA-Z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

  // Looks for standard date formats near Agreement, Effective, or Dated as of
  const agreementMatch = cleanText.match(/(?:agreement|effective|dated)[\s]*(?:date|as of|on)?[\s:]*([a-zA-Z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

  return {
    borrower_name: borrowerMatch?.[1]?.trim() || "Not Found",
    loan_amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0,
    maturity_date: parseDate(maturityMatch?.[1]?.trim() || ""),
    agreement_date: parseDate(agreementMatch?.[1]?.trim() || ""),
    raw_text: text.substring(0, 1500), // Show more raw text in the UI for debugging
  };
}

function parseDate(dateStr: string): string {
  if (!dateStr) return "Not Found";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().split("T")[0]; // Format to YYYY-MM-DD
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
