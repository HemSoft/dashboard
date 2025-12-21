import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Separator } from './separator'

describe('Separator', () => {
  it('renders correctly', () => {
    const { container } = render(<Separator />)
    expect(container.firstChild).toBeDefined()
  })

  it('applies orientation classes', () => {
    const { container } = render(<Separator orientation="vertical" />)
    expect(container.firstChild).toHaveAttribute('data-orientation', 'vertical')
  })
})
