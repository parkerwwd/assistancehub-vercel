
export interface ImportResult {
  success: boolean;
  processedCount?: number;
  errorCount?: number;
  message?: string;
  error?: string;
}

export interface ImportProgress {
  current: number;
  total: number;
  currentRecord?: string;
}
