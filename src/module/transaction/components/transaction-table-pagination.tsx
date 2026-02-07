import * as React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/shared/ui/pagination';

type TransactionTablePaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  limit: number;
  setPage: (nextPage: number) => void | Promise<unknown>;
};

const TransactionTablePagination = ({
  page,
  pageCount,
  total,
  limit,
  setPage,
}: TransactionTablePaginationProps) => {
  const showingStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = total === 0 ? 0 : Math.min(total, page * limit);
  const canPreviousPage = page > 1;
  const canNextPage = page < pageCount;
  const pages = React.useMemo(() => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 'ellipsis', pageCount];
    }

    if (page >= pageCount - 2) {
      return [
        1,
        'ellipsis',
        pageCount - 3,
        pageCount - 2,
        pageCount - 1,
        pageCount,
      ];
    }

    return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount];
  }, [page, pageCount]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="text-muted-foreground">
        Showing {showingStart}-{showingEnd} of {total}
      </div>
      <div className="flex w-full flex-col items-start gap-3.5 sm:w-auto sm:items-end">
        <span className="text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <Pagination className="w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(event) => {
                  event.preventDefault();
                  if (!canPreviousPage) return;
                  void setPage(page - 1);
                }}
                href="#"
                aria-disabled={!canPreviousPage}
                className={!canPreviousPage ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
            {pages.map((item, index) => {
              if (item === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              const pageNumber = item;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === page}
                    onClick={(event) => {
                      event.preventDefault();
                      void setPage(pageNumber as number);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={(event) => {
                  event.preventDefault();
                  if (!canNextPage) return;
                  void setPage(page + 1);
                }}
                href="#"
                aria-disabled={!canNextPage}
                className={!canNextPage ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default TransactionTablePagination;
