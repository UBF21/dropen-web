import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import AdminGuard from '../AdminGuard'

vi.mock('@/hooks/useAdmin')

import { useAdmin } from '@/hooks/useAdmin'

describe('AdminGuard', () => {
  it('muestra spinner mientras carga', () => {
    vi.mocked(useAdmin).mockReturnValue({
      user: null, profile: null, role: null, loading: true, signOut: vi.fn(), can: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminGuard><div>Panel</div></AdminGuard>
      </MemoryRouter>
    )
    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })

  it('redirige a login sin sesión', () => {
    vi.mocked(useAdmin).mockReturnValue({
      user: null, profile: null, role: null, loading: false, signOut: vi.fn(), can: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminGuard><div>Panel</div></AdminGuard>
      </MemoryRouter>
    )
    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })

  it('muestra children con sesión válida', () => {
    const mockUser = { id: 'u1', email: 'admin@dropen.com' } as never
    const mockProfile = { user_id: 'u1', role: 'admin' as const, display_name: null, avatar_url: null }
    vi.mocked(useAdmin).mockReturnValue({
      user: mockUser, profile: mockProfile, role: 'admin', loading: false, signOut: vi.fn(), can: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminGuard><div>Panel</div></AdminGuard>
      </MemoryRouter>
    )
    expect(screen.getByText('Panel')).toBeInTheDocument()
  })
})
