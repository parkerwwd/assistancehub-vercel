// Types for improved property upload error reporting

export interface UploadError {
  row: number;
  data: Record<string, any>;
  error: {
    code: string;
    message: string;
    details?: string;
    column?: string;
  };
}

export interface ErrorSummary {
  duplicates: number;
  invalidData: number;
  missingRequired: number;
  other: number;
  errors: UploadError[];
}

export interface EnhancedUploadProgress {
  status: 'idle' | 'uploading' | 'complete' | 'error';
  totalRecords: number;
  processed: number;
  successful: number;
  errors: number;
  currentChunk: number;
  totalChunks: number;
  errorSummary?: ErrorSummary;
}

export interface ErrorReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorSummary: ErrorSummary;
  onDownloadErrors: () => void;
} 