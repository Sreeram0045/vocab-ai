
import { authConfig } from '@/auth.config'
import { describe, it, expect } from 'vitest'

describe('Auth Configuration - Authorization Logic', () => {
  const authorized = authConfig.callbacks?.authorized;

  if (!authorized) {
    throw new Error('Authorized callback is not defined');
  }

  it('should allow unauthenticated users to access the login page', async () => {
    const auth = null
    const nextUrl = new URL('http://localhost/login')
    
    const result = await authorized({ auth, request: { nextUrl } })
    expect(result).toBe(true)
  })

  it('should redirect authenticated users from login page to dashboard', async () => {
    const auth = { user: { name: 'Test User' } }
    const nextUrl = new URL('http://localhost/login')
    
    const result = await authorized({ auth, request: { nextUrl } })
    
    expect(result).toBeInstanceOf(Response)
    const response = result as Response
    // Status for Response.redirect is usually 302
    expect(response.status).toBe(302) 
    expect(response.headers.get('Location')).toBe('http://localhost/')
  })

  it('should allow authenticated users to access protected pages (dashboard)', async () => {
    const auth = { user: { name: 'Test User' } }
    const nextUrl = new URL('http://localhost/')
    
    const result = await authorized({ auth, request: { nextUrl } })
    expect(result).toBe(true)
  })

  it('should prevent unauthenticated users from accessing protected pages', async () => {
    const auth = null
    const nextUrl = new URL('http://localhost/')
    
    const result = await authorized({ auth, request: { nextUrl } })
    expect(result).toBe(false)
  })
})
