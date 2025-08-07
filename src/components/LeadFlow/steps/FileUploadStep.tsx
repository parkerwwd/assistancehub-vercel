import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { FlowStepWithFields } from '@/types/leadFlow';
import { Button } from '@/components/ui/button';

interface FileUploadStepProps {
  step: FlowStepWithFields;
  onChange: (fieldName: string, value: any) => void;
  values: Record<string, any>;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  base64?: string;
}

export default function FileUploadStep({ step, onChange, values }: FileUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const field = step.fields?.[0];
  if (!field) return null;
  
  const uploadedFiles: UploadedFile[] = values[field.field_name] || [];
  
  // Extract configuration
  const acceptedTypes = field.validation_rules?.acceptedTypes || '.pdf,.doc,.docx,.jpg,.jpeg,.png';
  const maxSize = field.validation_rules?.maxSize || 5 * 1024 * 1024; // 5MB default
  const maxFiles = field.validation_rules?.maxFiles || 3;
  const multiple = field.validation_rules?.multiple !== false;
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const validateFile = (file: File): string | null => {
    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = acceptedTypes.split(',').map(t => t.trim().toLowerCase());
    
    if (!acceptedExtensions.includes(extension)) {
      return `File type ${extension} is not allowed. Accepted types: ${acceptedTypes}`;
    }
    
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`;
    }
    
    return null;
  };
  
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError(null);
    setUploading(true);
    
    try {
      const newFiles: UploadedFile[] = [];
      const filesToProcess = Array.from(files).slice(0, maxFiles - uploadedFiles.length);
      
      for (const file of filesToProcess) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }
        
        // Convert to base64 for storage (in a real app, you'd upload to a service)
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          base64
        });
      }
      
      if (newFiles.length > 0) {
        const updatedFiles = [...uploadedFiles, ...newFiles].slice(0, maxFiles);
        onChange(field.field_name, updatedFiles);
      }
    } catch (err) {
      setError('Failed to process files. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };
  
  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    onChange(field.field_name, updatedFiles);
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  return (
    <div className="space-y-6">
      {step.content && (
        <div 
          className="prose prose-gray max-w-none text-center"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}
      
      <div className="max-w-xl mx-auto">
        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes}
            onChange={handleChange}
            className="hidden"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <p className="text-lg font-medium mb-2">
            {dragActive ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          
          <p className="text-sm text-gray-500 mb-4">or</p>
          
          <Button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading || uploadedFiles.length >= maxFiles}
            variant="outline"
          >
            Browse Files
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            {multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max {formatFileSize(maxSize)} • {acceptedTypes}
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
        
        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Files ({uploadedFiles.length}/{maxFiles})
            </h4>
            
            <AnimatePresence>
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Help Text */}
        {field.help_text && (
          <p className="mt-4 text-sm text-gray-500 text-center">
            {field.help_text}
          </p>
        )}
      </div>
    </div>
  );
}
