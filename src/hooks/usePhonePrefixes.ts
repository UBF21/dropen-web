import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface PhonePrefix {
  code: string
  label: string
}

const FALLBACK: PhonePrefix[] = [
  { code: '+51',  label: '+51 · Perú'            },
  { code: '+1',   label: '+1 · EE.UU. / Canadá'  },
  { code: '+52',  label: '+52 · México'           },
  { code: '+54',  label: '+54 · Argentina'        },
  { code: '+55',  label: '+55 · Brasil'           },
  { code: '+56',  label: '+56 · Chile'            },
  { code: '+57',  label: '+57 · Colombia'         },
  { code: '+58',  label: '+58 · Venezuela'        },
  { code: '+34',  label: '+34 · España'           },
  { code: '+591', label: '+591 · Bolivia'         },
  { code: '+593', label: '+593 · Ecuador'         },
  { code: '+595', label: '+595 · Paraguay'        },
  { code: '+598', label: '+598 · Uruguay'         },
  { code: '+44',  label: '+44 · Reino Unido'      },
]

export function usePhonePrefixes(): PhonePrefix[] {
  const [prefixes, setPrefixes] = useState<PhonePrefix[]>(FALLBACK)

  useEffect(() => {
    supabase
      .from('phone_prefixes')
      .select('code, label')
      .eq('active', true)
      .order('sort_order')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setPrefixes(data)
      })
  }, [])

  return prefixes
}
