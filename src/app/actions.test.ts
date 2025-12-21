import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addDemoRecord } from './actions'

const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ error: null }),
  })),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds a demo record successfully', async () => {
    const formData = new FormData()
    formData.append('name', 'Test Record')

    await addDemoRecord(formData)

    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith('demo')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('does nothing if name is missing', async () => {
    const formData = new FormData()
    await addDemoRecord(formData)
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('logs error if insert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockInsert = vi.fn().mockResolvedValue({ error: new Error('Insert failed') })
    vi.mocked(mockSupabase.from).mockReturnValue({ insert: mockInsert } as unknown as ReturnType<typeof mockSupabase.from>)

    const formData = new FormData()
    formData.append('name', 'Test Record')

    await addDemoRecord(formData)

    expect(consoleSpy).toHaveBeenCalledWith('Error adding record:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
