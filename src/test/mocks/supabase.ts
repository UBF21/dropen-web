import { vi } from 'vitest'

export const mockFrom = vi.fn()
export const mockSelect = vi.fn()
export const mockInsert = vi.fn()
export const mockUpdate = vi.fn()
export const mockEq = vi.fn()
export const mockIn = vi.fn()
export const mockSingle = vi.fn()
export const mockLte = vi.fn()
export const mockGt = vi.fn()

const chain: Record<string, ReturnType<typeof vi.fn>> = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  in: mockIn,
  single: mockSingle,
  lte: mockLte,
  gt: mockGt,
}

Object.values(chain).forEach((fn) => fn.mockReturnValue(chain))

export const mockSupabase = {
  from: mockFrom.mockReturnValue(chain),
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
}

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))
