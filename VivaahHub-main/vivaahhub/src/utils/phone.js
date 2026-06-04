export const DEFAULT_PHONE_PREFIX = "+91"
export const INDIAN_PHONE_REGEX = /^\+91[6-9]\d{9}$/
export const PHONE_PLACEHOLDER = "9876543210"

/** Strip to 10-digit mobile (6–9 start), then prefix +91 */
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

/** Keep +91 prefix; user types only the 10-digit part */
export const formatPhoneInput = (value) => {
  const digits = String(value).replace(/\D/g, "")
  let mobile = digits

  if (digits.startsWith("91")) {
    mobile = digits.slice(2)
  } else if (digits.startsWith("0")) {
    mobile = digits.slice(1)
  }

  mobile = mobile.slice(0, 10)
  return mobile.length ? `${DEFAULT_PHONE_PREFIX}${mobile}` : DEFAULT_PHONE_PREFIX
}
