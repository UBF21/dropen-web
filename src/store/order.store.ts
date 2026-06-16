import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DocType } from '@/types'

interface OrderStore {
  // Paso 1
  firstName: string
  lastName: string
  docType: DocType
  docNumber: string
  phonePrefix: string
  phone: string
  // Paso 2
  address: string
  lat: number | null
  lng: number | null
  department: string
  province: string
  district: string
  country: string
  // Wizard
  step: 1 | 2 | 3
  // Resultado
  orderId: string | null

  setStep: (step: 1 | 2 | 3) => void
  setPersonal: (data: { firstName: string; lastName: string; docType: DocType; docNumber: string; phonePrefix: string; phone: string }) => void
  setAddress: (data: {
    address: string
    lat: number | null
    lng: number | null
    department: string
    province: string
    district: string
    country: string
  }) => void
  setOrderId: (id: string) => void
  reset: () => void
}

const INITIAL_STATE = {
  firstName: '', lastName: '', docType: 'DNI' as DocType, docNumber: '',
  phonePrefix: '+51', phone: '',
  address: '', lat: null, lng: null, department: '', province: '', district: '', country: 'PE',
  step: 1 as const, orderId: null,
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setStep: (step) => set({ step }),
      setPersonal: (data) => set(data),
      setAddress: (data) => set(data),
      setOrderId: (orderId) => set({ orderId }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'dropen-checkout',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
