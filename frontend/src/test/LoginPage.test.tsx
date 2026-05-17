import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { LoginPage } from '../pages/LoginPage'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/client', () => ({
  getJson: vi.fn().mockResolvedValue({ data: { userId: '' } }),
  getUserId: vi.fn().mockReturnValue(''),
  setUserId: vi.fn(),
}))

describe('LoginPage', () => {
  it('stores the user id through context on submit', async () => {
    const user = userEvent.setup()
    const setUserId = vi.fn()

    render(
      <AppContext.Provider
        value={{
          userId: '',
          setUserId,
          unseenNotifications: 0,
          refreshNotificationCount: vi.fn().mockResolvedValue(undefined),
        }}
      >
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AppContext.Provider>,
    )

    await waitFor(() => expect(screen.getByPlaceholderText('Paste or type your user ID')).toBeInTheDocument())
    await user.type(screen.getByPlaceholderText('Paste or type your user ID'), 'user-123')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(setUserId).toHaveBeenCalledWith('user-123')
  })
})