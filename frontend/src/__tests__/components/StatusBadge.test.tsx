import { render, screen } from '@testing-library/react'
import StatusBadge from '../../components/prescriptions/StatusBadge'

describe('StatusBadge', () => {
  it('renders Pending with yellow styles', () => {
    render(<StatusBadge status="Pending" />)
    const badge = screen.getByText('Pending')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('renders Approved with green styles', () => {
    render(<StatusBadge status="Approved" />)
    const badge = screen.getByText('Approved')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('renders Dispensed with blue styles', () => {
    render(<StatusBadge status="Dispensed" />)
    const badge = screen.getByText('Dispensed')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('renders unknown status with fallback grey styles', () => {
    render(<StatusBadge status="Unknown" />)
    const badge = screen.getByText('Unknown')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
  })
})
