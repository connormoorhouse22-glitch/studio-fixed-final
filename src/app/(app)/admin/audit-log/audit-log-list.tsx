
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type AuditLogEvent } from '@/lib/audit-log-actions';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { Search, Activity, BookUser, Package, ShoppingBasket, Truck, Wine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClientSideTimestamp } from '@/components/client-side-timestamp';

interface AuditLogListProps {
  initialLogs: AuditLogEvent[];
}

const getIcon = (eventType: string) => {
    if (eventType.includes('ORDER')) return <ShoppingBasket className="h-4 w-4 text-muted-foreground" />;
    if (eventType.includes('USER')) return <BookUser className="h-4 w-4 text-muted-foreground" />;
    if (eventType.includes('BOOKING')) return <Truck className="h-4 w-4 text-muted-foreground" />;
    if (eventType.includes('PRODUCT')) return <Package className="h-4 w-4 text-muted-foreground" />;
    if (eventType.includes('BULK')) return <Wine className="h-4 w-4 text-muted-foreground" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
};

export function AuditLogList({ initialLogs }: AuditLogListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = initialLogs.filter(log => {
    const searchString = `
      ${log.actor.email}
      ${log.actor.company}
      ${log.event}
      ${log.entity.id}
      ${log.details.summary}
    `.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs by user, event, ID, or details..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <ScrollArea className="h-[65vh]">
            <Table>
            <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                <TableHead className="w-[250px]">Actor</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[180px] text-right">Timestamp</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                        <TableRow key={log.id}>
                        <TableCell>
                            <div className="font-medium">{log.actor.company}</div>
                            <div className="text-xs text-muted-foreground">{log.actor.email}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="flex items-center gap-2 w-fit">
                                {getIcon(log.event)}
                                {log.event}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <p className="text-sm">{log.details.summary}</p>
                            <p className="text-xs text-muted-foreground">Entity: {log.entity.type} - {log.entity.id}</p>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                           <ClientSideTimestamp timestamp={log.timestamp} />
                        </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        No logs match your search.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
