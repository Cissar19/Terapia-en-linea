import { useState, useMemo } from "react";

/**
 * Simple client-side pagination hook.
 * Returns a paginated slice of the input array and controls.
 */
export function usePagination<T>(items: T[], pageSize = 10) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(page, totalPages);

    const paginatedItems = useMemo(
        () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [items, currentPage, pageSize]
    );

    return {
        items: paginatedItems,
        page: currentPage,
        totalPages,
        totalItems: items.length,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
        prevPage: () => setPage((p) => Math.max(p - 1, 1)),
        goToPage: (n: number) => setPage(Math.max(1, Math.min(n, totalPages))),
        reset: () => setPage(1),
    };
}
