import React, { useState, useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * =========================================================================
 * QuickList Component — Generic Compact Sidebar List
 * =========================================================================
 *
 * A fully reusable, sortable, paginated sidebar list.
 * Columns and cell rendering are supplied entirely via props — no entity-
 * specific logic lives inside this component.
 *
 * Part of Step 6 optimization (Performance Optimization)
 * v1.12.500 - Memoized with React.memo to prevent unnecessary re-renders
 *
 * Props:
 *   items          — Array of objects; each must have an `id: number` field
 *   columns        — Column definitions (key, label, optional render fn)
 *   selectedId     — ID of the currently active/selected row
 *   onSelect       — Callback fired when a row is clicked
 *   pageSize       — Rows per page (default: 15)
 *   initialSortCol — Column key to sort by initially
 *   initialSortDir — Initial sort direction (default: 'asc')
 *   emptyText      — Message shown when there are no rows (default: 'No results found.')
 *   title          — Header label (default: 'Quick List')
 *   icon           — Optional lucide icon node rendered in the header badge
 *   iconBg         — Background colour of the icon badge (default: #f3f4f6)
 *   iconColor      — Icon / text colour inside the badge (default: var(--foreground))
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuickSortKey = string;
export type QuickSortDir = 'asc' | 'desc';

/** Minimum shape required for every item passed to QuickList. */
export interface QuickListItem {
  id: number;
  [key: string]: unknown;
}

/**
 * Column definition for QuickList.
 *
 * @template T  The item type (must extend QuickListItem)
 *
 * key       — Unique column identifier; also used as the default sort key.
 * label     — Header text displayed in <th>.
 * sortKey   — Override which item field is used for sorting (defaults to `key`)
 * render    — Custom cell renderer. Receives the item and a boolean indicating
 *             whether this row is currently selected. Falls back to
 *             `String(item[key] ?? '')` when omitted.
 * thAlign   — Header text alignment (default: 'center').
 * tdAlign   — Cell text alignment (default: 'left').
 */
export interface QuickListColumn<T extends QuickListItem = QuickListItem> {
  key: string;
  label: string;
  sortKey?: string;
  render?: (item: T, isSelected: boolean) => React.ReactNode;
  thAlign?: 'left' | 'center' | 'right';
  tdAlign?: 'left' | 'center' | 'right';
}

export interface QuickListProps<T extends QuickListItem = QuickListItem> {
  items: T[];
  columns: QuickListColumn<T>[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  pageSize?: number;
  initialSortCol?: string | null;
  initialSortDir?: QuickSortDir;
  emptyText?: string;
  title?: string;
  /** Optional lucide icon node rendered in the header badge */
  icon?: React.ReactNode;
  /** Background colour of the icon badge (default: #f3f4f6) */
  iconBg?: string;
  /** Icon / text colour inside the badge (default: var(--foreground)) */
  iconColor?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortItems<T extends QuickListItem>(
  items: T[],
  key: string | null,
  dir: QuickSortDir
): T[] {
  if (!key) return items;
  return [...items].sort((a, b) => {
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true });
    return dir === 'asc' ? cmp : -cmp;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const QuickList = memo(function QuickList<T extends QuickListItem = QuickListItem>({
  items,
  columns,
  selectedId,
  onSelect,
  pageSize = 15,
  initialSortCol,
  initialSortDir,
  emptyText = 'No results found.',
  title = 'Quick List',
  icon,
  iconBg = '#f3f4f6',
  iconColor = 'var(--foreground)',
}: QuickListProps<T>) {
  const defaultSortCol = initialSortCol !== undefined ? initialSortCol : (columns[0]?.key ?? null);

  const [sortCol, setSortCol] = useState<string | null>(defaultSortCol);
  const [sortDir, setSortDir] = useState<QuickSortDir>(initialSortDir ?? 'asc');
  const [page, setPage]       = useState(1);

  const handleSort = (col: string, sortKey?: string) => {
    const effectiveKey = sortKey ?? col;
    if (sortCol === effectiveKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(effectiveKey);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sorted     = useMemo(() => sortItems(items, sortCol, sortDir), [items, sortCol, sortDir]);
  const total      = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * pageSize;
  const end        = Math.min(start + pageSize, total);
  const paged      = sorted.slice(start, end);

  return (
    <div className="quick-list-card">
      {/* Header */}
      <div className="quick-list-header">
        <h3 className="quick-list-title">
          <span className="quick-list-title-inner">
            {icon && (
              <span
                className="quick-list-icon-badge"
                style={{ color: iconColor }}
              >
                {icon}
              </span>
            )}
            {title}
          </span>
        </h3>
      </div>

      {/* Table */}
      <div className="quick-list-table-wrap">
        <table className="quick-list-table">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const effectiveKey = col.sortKey ?? col.key;
                const isActive = sortCol === effectiveKey;
                const thClass = [
                  'quick-list-th',
                  'quick-list-col-header',
                  idx === 0 ? 'col-first' : '',
                  idx === columns.length - 1 ? 'col-last' : '',
                  col.thAlign ? `col-align-${col.thAlign}` : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <th
                    key={col.key}
                    className={thClass}
                    onClick={() => handleSort(col.key, col.sortKey)}
                    aria-label={`Sort by ${col.label}`}
                    aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.map((item, idx) => {
              const isSelected = item.id === selectedId;
              const isEven     = (start + idx) % 2 === 0;

              const rowClass = [
                'quick-list-row',
                isSelected
                  ? 'quick-list-row--selected'
                  : isEven
                  ? 'quick-list-row--even'
                  : 'quick-list-row--odd',
              ].join(' ');

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect?.(item.id)}
                  className={rowClass}
                  aria-selected={isSelected}
                >
                  {columns.map((col, idx) => {
                    const tdClass = [
                      'quick-list-td',
                      idx === 0 ? 'col-first' : '',
                      idx === columns.length - 1 ? 'col-last' : '',
                      col.tdAlign ? `col-align-${col.tdAlign}` : '',
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <td key={col.key} className={tdClass}>
                        {col.render
                          ? col.render(item, isSelected)
                          : String(item[col.key] ?? '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {paged.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="quick-list-empty-cell"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="quick-list-footer flex items-center justify-between border-t">
          <span className="quick-list-range">
            {total === 0 ? 0 : start + 1}–{end} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="quick-list-page-btn flex items-center justify-center rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="quick-list-page-label">
              {safePage}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="quick-list-page-btn flex items-center justify-center rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
              aria-label="Next page"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Summary — single page */}
      {totalPages === 1 && total > 0 && (
        <div className="quick-list-footer border-t">
          <span className="quick-list-range">
            {total} result{total !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
});