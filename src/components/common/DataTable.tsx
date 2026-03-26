import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  /** Minimum column width (default: '8rem') */
  minWidth?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  rowKey?: keyof T;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

type SortOrder = 'asc' | 'desc' | null;

/** Render a cell value as a string safe for title/tooltip */
function toPlainText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 20,
  loading = false,
  onRowClick,
  rowKey = 'id' as keyof T,
  emptyMessage = 'No records found',
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(lower)
      )
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortOrder) return filtered;
    return [...filtered].sort((a, b) => {
      const va = String(a[sortKey] ?? '');
      const vb = String(b[sortKey] ?? '');
      return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [filtered, sortKey, sortOrder]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortKey(null);
      setSortOrder(null);
    }
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            className="pl-10"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      )}

      {/* Horizontal scroll wrapper */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  style={{ minWidth: col.minWidth ?? '8rem' }}
                  className={cn(
                    'whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === String(col.key)
                        ? sortOrder === 'asc'
                          ? <ChevronUp size={14} />
                          : <ChevronDown size={14} />
                        : <ChevronsUpDown size={14} className="opacity-40" />
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead style={{ minWidth: '6rem' }}>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-10 text-gray-400"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-10 text-gray-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, idx) => (
                <TableRow
                  key={String(row[rowKey as string] ?? idx)}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => {
                    const rawValue = row[String(col.key)];
                    const rendered = col.render
                      ? col.render(rawValue, row)
                      : String(rawValue ?? '');

                    // For rendered JSX, we can't easily extract plain text for title;
                    // use raw value string as the tooltip source.
                    const titleText = toPlainText(rawValue);

                    return (
                      <TableCell
                        key={String(col.key)}
                        style={{ minWidth: col.minWidth ?? '8rem' }}
                        className={cn('max-w-[16rem]', col.className)}
                      >
                        {/* Ellipsis wrapper with tooltip */}
                        <div
                          className="truncate"
                          title={titleText || undefined}
                        >
                          {rendered}
                        </div>
                      </TableCell>
                    );
                  })}
                  {actions && (
                    <TableCell
                      style={{ minWidth: '6rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
