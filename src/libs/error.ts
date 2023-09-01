import type { ClerkAPIError } from '@clerk/types'

export interface APIResponseError {
  errors: ClerkAPIError[]
}

export function parseError(error: APIResponseError): string {
  if (!error) {
    return ''
  }

  console.log(error)

  if (error.errors) {
    return error.errors[0].longMessage || ''
  }

  throw error
}
