
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calendar, Plus, Edit, Database } from "lucide-react";
import { FileUploadRecord } from '../hooks/usePHAStats';

interface PHAUploadsTableProps {
  uploads: FileUploadRecord[];
}

export const PHAUploadsTable: React.FC<PHAUploadsTableProps> = ({ uploads }) => {
  console.log('PHAUploadsTable rendering with uploads:', uploads);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (uploads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            File Upload History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No file uploads recorded yet</p>
            <p className="text-sm mt-2">Upload CSV files to see detailed statistics here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          File Upload History ({uploads.length} files)
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
