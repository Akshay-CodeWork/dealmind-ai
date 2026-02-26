import type { DealRecord } from "./cleaning-engine";

export interface DiscrepancyRecord {
  Deal_ID: string;
  Loan_Mismatch: boolean;
  Name_Mismatch: boolean;
  Date_Mismatch: boolean;
  FE_Loan_Amount: number;
  BE_Loan_Amount: number;
  FE_Borrower_Name: string;
  BE_Borrower_Name: string;
  FE_Maturity_Date: string;
  BE_Maturity_Date: string;
}

export interface DiscrepancyResult {
  totalRecordsCompared: number;
  totalMismatches: number;
  discrepancies: DiscrepancyRecord[];
}

export function detectDiscrepancies(
  frontend: DealRecord[],
  backend: DealRecord[]
): DiscrepancyResult {
  const beMap = new Map(backend.map((r) => [r.Deal_ID, r]));

  const discrepancies: DiscrepancyRecord[] = [];

  for (const fe of frontend) {
    const be = beMap.get(fe.Deal_ID);
    if (!be) continue;

    const loanMismatch = Math.abs(fe.Loan_Amount - be.Loan_Amount) > 0.01;
    const nameMismatch = fe.Borrower_Name.toLowerCase() !== be.Borrower_Name.toLowerCase();
    const dateMismatch = fe.Maturity_Date !== be.Maturity_Date;

    discrepancies.push({
      Deal_ID: fe.Deal_ID,
      Loan_Mismatch: loanMismatch,
      Name_Mismatch: nameMismatch,
      Date_Mismatch: dateMismatch,
      FE_Loan_Amount: fe.Loan_Amount,
      BE_Loan_Amount: be.Loan_Amount,
      FE_Borrower_Name: fe.Borrower_Name,
      BE_Borrower_Name: be.Borrower_Name,
      FE_Maturity_Date: fe.Maturity_Date,
      BE_Maturity_Date: be.Maturity_Date,
    });
  }

  const mismatches = discrepancies.filter(
    (d) => d.Loan_Mismatch || d.Name_Mismatch || d.Date_Mismatch
  );

  return {
    totalRecordsCompared: discrepancies.length,
    totalMismatches: mismatches.length,
    discrepancies,
  };
}
