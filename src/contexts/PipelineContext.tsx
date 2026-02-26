import { createContext, useContext, useState, ReactNode } from "react";
import type { DealRecord, CleaningResult } from "@/lib/cleaning-engine";
import type { DiscrepancyResult } from "@/lib/discrepancy-engine";
import type { LegalExtraction } from "@/lib/legal-engine";

interface PipelineState {
  // Upload state
  frontendFile: File | null;
  backendFile: File | null;
  legalFile: File | null;
  frontendRaw: Record<string, string>[] | null;
  backendRaw: Record<string, string>[] | null;
  legalText: string | null;

  // Processing results
  frontendCleaning: CleaningResult | null;
  backendCleaning: CleaningResult | null;
  discrepancy: DiscrepancyResult | null;
  legalExtraction: LegalExtraction | null;

  // Status
  uploadComplete: boolean;
  cleaningComplete: boolean;
  discrepancyComplete: boolean;
  legalComplete: boolean;
}

interface PipelineContextType extends PipelineState {
  setUploadData: (
    feFile: File, beFile: File, legalFile: File,
    feData: Record<string, string>[], beData: Record<string, string>[],
    legalText: string
  ) => void;
  setCleaningResults: (fe: CleaningResult, be: CleaningResult) => void;
  setDiscrepancyResult: (result: DiscrepancyResult) => void;
  setLegalResult: (result: LegalExtraction) => void;
  reset: () => void;
}

const initial: PipelineState = {
  frontendFile: null, backendFile: null, legalFile: null,
  frontendRaw: null, backendRaw: null, legalText: null,
  frontendCleaning: null, backendCleaning: null,
  discrepancy: null, legalExtraction: null,
  uploadComplete: false, cleaningComplete: false,
  discrepancyComplete: false, legalComplete: false,
};

const PipelineContext = createContext<PipelineContextType | null>(null);

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PipelineState>(initial);

  const setUploadData = (
    feFile: File, beFile: File, legalFile: File,
    feData: Record<string, string>[], beData: Record<string, string>[],
    legalText: string
  ) => {
    setState((s) => ({
      ...s,
      frontendFile: feFile, backendFile: beFile, legalFile,
      frontendRaw: feData, backendRaw: beData, legalText,
      uploadComplete: true,
    }));
  };

  const setCleaningResults = (fe: CleaningResult, be: CleaningResult) => {
    setState((s) => ({ ...s, frontendCleaning: fe, backendCleaning: be, cleaningComplete: true }));
  };

  const setDiscrepancyResult = (result: DiscrepancyResult) => {
    setState((s) => ({ ...s, discrepancy: result, discrepancyComplete: true }));
  };

  const setLegalResult = (result: LegalExtraction) => {
    setState((s) => ({ ...s, legalExtraction: result, legalComplete: true }));
  };

  const reset = () => setState(initial);

  return (
    <PipelineContext.Provider value={{ ...state, setUploadData, setCleaningResults, setDiscrepancyResult, setLegalResult, reset }}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error("usePipeline must be used within PipelineProvider");
  return ctx;
}
