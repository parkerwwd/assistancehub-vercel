
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calendar, Plus, Edit, Database } from "lucide-react";
import { FileUploadRecord } from '../hooks/usePHAStats';
import { useIsMobile } from "@/hooks/use-mobile";

interface PHAUploadsTableProps {
  uploads: FileUploadRecord[];
}

export const PHAUploadsTable: React.FC<PHAUploadsTableProps> = ({ uploads }) => {
  console.log('PHAUploadsTable rendering with uploads:', uploads);
  const isMobile = useIsMobile();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (uploads.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-gray-500">
        <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
        <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">No file uploads recorded yet</p>
        <p className="text-xs sm:text-sm">Upload CSV files to see detailed statistics here</p>
      </div>
    );
  }

  // Mobile Card Layout
  if (isMobile) {
    return (
      <div className="space-y-3">
        {uploads.map((upload, index) => (
          <Card key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* File Name */}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">File Name</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{upload.fileName}</p>
                  </div>
                </div>

                {/* Upload Date */}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-purple-100 rounded-lg flex-shrink-0">
                    <Calendar className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">Upload Date</p>
                    <p className="text-sm text-gray-700">{formatDate(upload.uploadDate)}</p>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Plus className="w-2.5 h-2.5 text-green-600" />
                      <span className="text-xs font-medium text-gray-500">Added</span>
                    </div>
                    <span className="text-sm font-bold text-green-700">
                      {upload.recordsAdded.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Edit className="w-2.5 h-2.5 text-blue-600" />
                      <span className="text-xs font-medium text-gray-500">Edited</span>
                    </div>
                    <span className="text-sm font-bold text-blue-700">
                      {upload.recordsEdited.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Database className="w-2.5 h-2.5 text-purple-600" />
                      <span className="text-xs font-medium text-gray-500">Total</span>
                    </div>
                    <span className="text-sm font-bold text-purple-700">
                      {upload.totalRecords.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop Table Layout
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                File Name
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upload Date
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Records Added
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Records Edited
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Total Processed
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.map((upload, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {upload.fileName}
              </TableCell>
              <TableCell>
                {formatDate(upload.uploadDate)}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {upload.recordsAdded.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {upload.recordsEdited.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {upload.totalRecords.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
