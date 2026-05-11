import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from '../api/client'

describe('resolveApiBaseUrl', () => {
  it('keeps localhost URLs', () => {
    expect(resolveApiBaseUrl('http://localhost:4000')).toBe('http://localhost:4000')
    expect(resolveApiBaseUrl('http://127.0.0.1:8080')).toBe('http://127.0.0.1:8080')
    expect(resolveApiBaseUrl('http://[::1]:4000')).toBe('http://[::1]:4000')
  })

  it('keeps relative URLs', () => {
    expect(resolveApiBaseUrl('/api')).toBe('/api')
  })

  it('falls back for external URLs', () => {
    expect(resolveApiBaseUrl('https://example.com/api')).toBe('http://localhost:4000')
  })

  it('falls back for empty values', () => {
    expect(resolveApiBaseUrl('')).toBe('http://localhost:4000')
    expect(resolveApiBaseUrl(undefined)).toBe('http://localhost:4000')
  })
})
