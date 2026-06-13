import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ReservationStore {
  reservationIds: string[]
  expiresAt: string | null
  reference: string | null
  setReservation: (ids: string[], expiresAt: string, reference: string) => void
  clearReservation: () => void
  isExpired: () => boolean
}

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      reservationIds: [],
      expiresAt: null,
      reference: null,
      setReservation(ids, expiresAt, reference) {
        set({ reservationIds: ids, expiresAt, reference })
      },
      clearReservation() {
        set({ reservationIds: [], expiresAt: null, reference: null })
      },
      isExpired() {
        const { expiresAt } = get()
        if (!expiresAt) return true
        return new Date(expiresAt).getTime() < Date.now()
      },
    }),
    {
      name: 'dropen-reservation',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
