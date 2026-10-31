import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { compactPhone, isEmail, isPhone, validateEnquiry } from '@/features/enquiry/validation'

const valid = { topic: 'buy', name: 'Asha Mehta', phone: '98290 12345', email: '', preference: 'call', message: '', consent: 'on' }

describe('browser-side enquiry checks', () => {
  it('pass a complete enquiry', () => {
    expect(validateEnquiry(valid)).toEqual({})
  })

  it('flag every missing required field at once', () => {
    expect(Object.keys(validateEnquiry({ ...valid, name: '', phone: '', consent: undefined })).sort()).toEqual(['consent', 'name', 'phone'])
  })

  it('require a message only for topics that need one', () => {
    expect(validateEnquiry({ ...valid, topic: 'other', message: 'hi' }).message).toBeDefined()
    expect(validateEnquiry({ ...valid, topic: 'sell', message: '' }).message).toBeDefined()
    expect(validateEnquiry({ ...valid, topic: 'other', message: 'Need a clearance for a hotel' }).message).toBeUndefined()
    expect(validateEnquiry({ ...valid, topic: 'buy', message: '' }).message).toBeUndefined()
  })

  it('require an email when the visitor asks to be emailed', () => {
    expect(validateEnquiry({ ...valid, preference: 'email' }).email).toBeDefined()
    expect(validateEnquiry({ ...valid, preference: 'email', email: 'asha@example.com' }).email).toBeUndefined()
  })

  it('skip fields the compact form does not render', () => {
    const compact = { topic: 'site-visit', name: valid.name, phone: valid.phone, consent: 'on' }
    expect(validateEnquiry(compact)).toEqual({})
  })
})

describe('isPhone', () => {
  it.each(['9829012345', '+91 98290 12345', '098290-12345', '919829012345', '+44 7700 900123'])('accepts %s', (phone) => {
    expect(isPhone(compactPhone(phone))).toBe(true)
  })

  // A +91 number must be a real Indian mobile, not merely any E.164 string.
  it.each(['+911234567890', '+91 55555 55555', '9999999999', '+919999999999', '12345', '98290 1234'])('rejects %s', (phone) => {
    expect(isPhone(compactPhone(phone))).toBe(false)
  })
})

describe('isEmail', () => {
  const samples = [
    'asha@example.com',
    'asha.mehta+site@mail.example.co.in',
    "o'neill@example.ie",
    'a@b',
    'asha@example',
    '.asha@example.com',
    'asha.@example.com',
    'as..ha@example.com',
    "asha'@example.com",
    'asha@@example.com',
    'asha@-example.com',
    'asha@example.c',
    'asha example@example.com',
    '@example.com',
    'asha@example.com\nBcc: x@evil.com',
  ]

  // The browser must agree with the server, or visitors see errors only after a round trip.
  it.each(samples)('agrees with the server schema on %j', (email) => {
    expect(isEmail(email)).toBe(z.email().safeParse(email).success)
  })

  it('cannot be slowed down by a long hostile input', () => {
    const started = performance.now()
    isEmail(`${'a.'.repeat(5000)}@${'b-'.repeat(5000)}`)
    expect(performance.now() - started).toBeLessThan(50)
  })
})
