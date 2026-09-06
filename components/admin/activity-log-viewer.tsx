"use client";

import { useState, useEffect } from "react";
import { ActivityLog } from "@/lib/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface ActivityLogViewerProps {
  userId?: string;
  limit?: number;
}

export function ActivityLogViewer({ userId, limit = 50 }: ActivityLogViewerProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      if (userId) params.append("userId", userId);

      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading activity logs...</div>;

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600 py-8">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    return status === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="w-full rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.eventName}</TableCell>
              <TableCell className="text-sm text-gray-600">{log.userId}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(log.status || "success")}>
                  {(log.status || "success").charAt(0).toUpperCase() +
                    (log.status || "success").slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {new Date(log.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
