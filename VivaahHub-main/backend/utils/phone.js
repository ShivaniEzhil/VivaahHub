/** Indian mobile: +91 followed by 10 digits starting with 6–9 */
export const INDIAN_PHONE_REGEX = /^\+91[6-9]\d{9}$/

export const INDIAN_PHONE_MESSAGE =
  "Phone must be a valid Indian number starting with +91 (e.g. +919876543210)"

export const normalizeIndianPhone = (phone) => {
  const digits = String(phone).replace(/\D/g, "")
  let mobile = digits

  if (digits.startsWith("91") && digits.length >= 12) {
    mobile = digits.slice(2, 12)
  } else if (digits.startsWith("0") && digits.length >= 11) {
    mobile = digits.slice(1, 11)
  } else if (digits.length > 10) {
    mobile = digits.slice(-10)
  }

  return `+91${mobile}`
}

export const isValidIndianPhone = (phone) => INDIAN_PHONE_REGEX.test(normalizeIndianPhone(phone))
