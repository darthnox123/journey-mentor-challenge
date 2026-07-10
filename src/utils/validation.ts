import type { SearchFormState } from '@/types/search'

export interface ValidationResult {
  valid: boolean
  errors: Partial<Record<keyof SearchFormState, string>>
}

const IATA_CODE_RE = /^[A-Z]{3}$/

export function validateSearchForm(form: SearchFormState): ValidationResult {
  const errors: ValidationResult['errors'] = {}

  if (!IATA_CODE_RE.test(form.origin)) {
    errors.origin = 'Choose an origin from the suggestions'
  }
  if (!IATA_CODE_RE.test(form.destination)) {
    errors.destination = 'Choose a destination from the suggestions'
  }
  if (form.origin && form.destination && form.origin === form.destination) {
    errors.destination = 'Destination must differ from origin'
  }
  if (!form.departureDate) {
    errors.departureDate = 'Choose a departure date'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const departure = new Date(`${form.departureDate}T00:00:00`)
    if (departure < today) {
      errors.departureDate = 'Departure date cannot be in the past'
    }
  }
  if (!Number.isInteger(form.passengers) || form.passengers < 1 || form.passengers > 9) {
    errors.passengers = 'Choose between 1 and 9 passengers'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
