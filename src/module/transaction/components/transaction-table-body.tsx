import { flexRender, type Table as ReactTable } from '@tanstack/react-table';
import { Skeleton } from '~/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/shared/ui/table';
import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from './transaction-table-actions';

type TransactionTableBodyProps = {
  table: ReactTable<Transaction>;
  columns: ColumnDef<Transaction>[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
};

const TransactionTableBody = ({
  table,
  columns,
  isLoading,
  isError,
  error,
}: TransactionTableBodyProps) => {
  const rows = table.getRowModel().rows;

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-md border">
      <Table className="min-w-full w-max text-sm">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-sm">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 30 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {columns.map((column, cellIndex) => (
                  <TableCell
                    key={`${String(column.id ?? cellIndex)}-${cellIndex}`}
                  >
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {isError
                  ? error?.message ?? 'Failed to load transactions.'
                  : 'No transactions yet.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTableBody;
