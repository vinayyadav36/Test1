import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getJson } from '../api/client';

export function LoginPage() {
  const { userId, setUserId } = useAppContext();
  const [value, setValue] = useState(userId);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!userId);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) return;
    getJson<{ data: { userId: string } | null }>('/api/health/first-user')
      .then((res) => {
        if (res.data?.userId) {
          setValue(res.data.userId);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!value.trim()) {
      setError('User ID is required.');
      return;
    }
    setError('');
    setUserId(value.trim());
    void navigate('/dashboard');
  }

  return (
    <main className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#4f46e5"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>SME Sync</h1>
          <p className="login-subtitle">Operations Platform</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={loading ? 'Looking for your account...' : 'Paste or type your user ID'}
              disabled={loading}
              autoFocus
            />
          </div>
          {error ? <div className="field-error">{error}</div> : null}
          {loading ? (
            <div className="field-hint">Checking for existing accounts...</div>
          ) : null}
          <button type="submit" className="btn-primary" disabled={loading || !value.trim()}>
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>
        <p className="login-footer">
          Use the user ID from the auto-seed output in your terminal, or create a new business to get started.
        </p>
      </div>
    </main>
  );
}