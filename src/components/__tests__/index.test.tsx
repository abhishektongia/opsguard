import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KPICard } from '@/components/Dashboard/KPICards'

describe('KPICard Component', () => {
  it('renders KPI card with title and value', () => {
    render(
      <KPICard
        title="Open Alerts"
        value={42}
        icon="🚨"
        description="Current active alerts"
      />
    )

    expect(screen.getByText('Open Alerts')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Current active alerts')).toBeInTheDocument()
  })

  it('displays trend indicator when trend is provided', () => {
    render(
      <KPICard
        title="MTTA"
        value={15}
        trend={{ direction: 'down', value: 2 }}
        icon="⏱️"
      />
    )

    expect(screen.getByText(/↓ 2/)).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const { container } = render(
      <KPICard
        title="Test"
        value={100}
        className="custom-class"
        icon="📊"
      />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('handles large numbers with formatting', () => {
    render(
      <KPICard
        title="Large Number"
        value={1000000}
        icon="💰"
      />
    )

    expect(screen.getByText('1000000')).toBeInTheDocument()
  })
})

/**
 * Example test for AlertFilters component
 */
describe('AlertFilters Component', () => {
  it('calls onFiltersChange when severity is selected', async () => {
    const user = userEvent.setup()
    const mockonChange = jest.fn()

    render(
      <AlertFilters onFiltersChange={mockonChange} />
    )

    const p1Button = screen.getByLabelText('P1')
    await user.click(p1Button)

    expect(mockonChange).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: expect.arrayContaining(['P1']),
      })
    )
  })

  it('supports multi-select for severity levels', async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()

    render(
      <AlertFilters onFiltersChange={mockOnChange} />
    )

    await user.click(screen.getByLabelText('P1'))
    await user.click(screen.getByLabelText('P2'))

    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        severity: ['P1', 'P2'],
      })
    )
  })

  it('filters by search term', async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()

    render(
      <AlertFilters onFiltersChange={mockOnChange} />
    )

    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'database')

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'database',
      })
    )
  })
})

/**
 * Example test for NotificationRuleBuilder component
 */
describe('NotificationRuleBuilder', () => {
  const mockUsers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ]

  const mockTeams = [
    { id: 'team1', name: 'DevOps' },
    { id: 'team2', name: 'Platform' },
  ]

  it('renders form with all fields', () => {
    render(
      <NotificationRuleBuilder
        users={mockUsers}
        teams={mockTeams}
      />
    )

    expect(screen.getByText('Create Notification Rule')).toBeInTheDocument()
    expect(screen.getByLabelText('Rule Name')).toBeInTheDocument()
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    const mockOnSave = jest.fn()

    render(
      <NotificationRuleBuilder
        users={mockUsers}
        teams={mockTeams}
        onSave={mockOnSave}
      />
    )

    const submitButton = screen.getByText('Create Rule')
    await user.click(submitButton)

    expect(mockOnSave).not.toHaveBeenCalled()
    expect(screen.getByText(/Rule name is required/i)).toBeInTheDocument()
  })

  it('submits rule with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSave = jest.fn()

    render(
      <NotificationRuleBuilder
        users={mockUsers}
        teams={mockTeams}
        onSave={mockOnSave}
      />
    )

    // Fill in form
    await user.type(screen.getByLabelText('Rule Name'), 'P1 Alerts')
    await user.click(screen.getByText('P1'))
    await user.click(screen.getByLabelText('Email'))

    const submitButton = screen.getByText('Create Rule')
    await user.click(submitButton)

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'P1 Alerts',
        severities: ['P1'],
        channels: ['email'],
      })
    )
  })
})
