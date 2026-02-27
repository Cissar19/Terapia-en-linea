interface PaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onNext: () => void;
    onPrev: () => void;
    label?: string;
}

export default function Pagination({
    page,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
    onNext,
    onPrev,
    label = "elementos",
}: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
                {totalItems} {label} · Pagina {page} de {totalPages}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onPrev}
                    disabled={!hasPrevPage}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    ← Anterior
                </button>
                <button
                    onClick={onNext}
                    disabled={!hasNextPage}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Siguiente →
                </button>
            </div>
        </div>
    );
}
