import React, { useState, useMemo } from 'react';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from '../ui/table';

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

  const handleSearchClear = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input
            className="pl-9 pr-8 h-9 text-sm bg-white border-slate-200 focus:border-primary"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button
              onClick={handleSearchClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Table container — overflow-x for horizontal scroll; sticky header works via main scroll */}
      <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-max w-full">
          <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-0">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  style={{ minWidth: col.minWidth ?? '8rem' }}
                  className={cn(
                    'whitespace-nowrap bg-transparent',
                    col.sortable && 'cursor-pointer select-none hover:text-slate-700',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === String(col.key)
                        ? sortOrder === 'asc'
                          ? <ChevronUp size={13} className="text-blue-500" />
                          : <ChevronDown size={13} className="text-blue-500" />
                        : <ChevronsUpDown size={13} className="opacity-30" />
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && (
                <TableHead style={{ minWidth: '7rem' }} className="text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-16 text-slate-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span className="text-sm">Loading…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-16 text-slate-400"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-sm font-medium">{emptyMessage}</span>
                    {search && (
                      <button
                        onClick={handleSearchClear}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, idx) => (
                <TableRow
                  key={String(row[rowKey as string] ?? idx)}
                  className={cn(
                    'border-b border-slate-100 transition-colors',
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white',
                    onRowClick && 'cursor-pointer hover:bg-blue-50/60'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => {
                    const rawValue = row[String(col.key)];
                    const rendered = col.render
                      ? col.render(rawValue, row)
                      : String(rawValue ?? '');
                    const titleText = toPlainText(rawValue);

                    return (
                      <TableCell
                        key={String(col.key)}
                        style={{ minWidth: col.minWidth ?? '8rem' }}
                        className={cn('max-w-[16rem]', col.className)}
                      >
                        <div className="truncate" title={titleText || undefined}>
                          {rendered}
                        </div>
                      </TableCell>
                    );
                  })}
                  {actions && (
                    <TableCell
                      style={{ minWidth: '7rem' }}
                      className="text-right"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
          <span className="text-xs">
            Showing{' '}
            <span className="font-medium text-slate-700">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-slate-700">{sorted.length}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="px-2 text-xs font-medium text-slate-600">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
