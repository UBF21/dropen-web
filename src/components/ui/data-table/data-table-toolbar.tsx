import { type Table } from '@tanstack/react-table'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DataTableFilterSheet } from './data-table-filter-sheet'
import { useState } from 'react'
import { type FilterField } from './data-table'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumn?: string
  searchPlaceholder?: string
  filterFields?: FilterField[]
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder,
  filterFields = [],
}: DataTableToolbarProps<TData>) {
  const [filterOpen, setFilterOpen] = useState(false)
  const hasActiveFilters = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center gap-2">
      {searchColumn && (
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
            onChange={e => table.getColumn(searchColumn)?.setFilterValue(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
        </div>
      )}

      {filterFields.length > 0 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(true)}
            className={hasActiveFilters ? 'border-accent text-accent' : ''}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-accent text-background text-xs w-5 h-5 flex items-center justify-center">
                {table.getState().columnFilters.length}
              </span>
            )}
          </Button>

          <DataTableFilterSheet
            open={filterOpen}
            onOpenChange={setFilterOpen}
            table={table}
            filterFields={filterFields}
          />
        </>
      )}
    </div>
  )
}
