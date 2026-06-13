import { type Table } from '@tanstack/react-table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { type FilterField } from './data-table'

interface DataTableFilterSheetProps<TData> {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  filterFields: FilterField[]
}

export function DataTableFilterSheet<TData>({
  open,
  onOpenChange,
  table,
  filterFields,
}: DataTableFilterSheetProps<TData>) {
  function clearAll() {
    table.resetColumnFilters()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface border-border w-80">
        <SheetHeader>
          <SheetTitle className="text-text-primary">Filtros avanzados</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-5">
          {filterFields.map(field => {
            const column = table.getColumn(field.id)
            if (!column) return null
            const value = column.getFilterValue()

            if (field.type === 'text') {
              return (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm text-text-primary">{field.label}</Label>
                  <Input
                    value={(value as string) ?? ''}
                    onChange={e => column.setFilterValue(e.target.value)}
                    className="bg-background h-9"
                  />
                </div>
              )
            }

            if (field.type === 'select') {
              return (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm text-text-primary">{field.label}</Label>
                  <Select
                    value={(value as string) ?? ''}
                    onValueChange={v => column.setFilterValue(v || undefined)}
                  >
                    <SelectTrigger className="bg-background h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {field.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            }

            if (field.type === 'multiselect') {
              const selected = (value as string[]) ?? []
              return (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm text-text-primary">{field.label}</Label>
                  <div className="space-y-2">
                    {field.options?.map(opt => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${field.id}-${opt.value}`}
                          checked={selected.includes(opt.value)}
                          onCheckedChange={checked => {
                            const next = checked
                              ? [...selected, opt.value]
                              : selected.filter(v => v !== opt.value)
                            column.setFilterValue(next.length ? next : undefined)
                          }}
                        />
                        <Label
                          htmlFor={`${field.id}-${opt.value}`}
                          className="text-sm text-text-primary cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            return null
          })}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={clearAll} className="w-full">
            Limpiar filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
