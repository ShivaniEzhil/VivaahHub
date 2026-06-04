export const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Jaipur",
]

export const DEFAULT_CITY = "Mumbai"

export const DEFAULT_MAP_CENTER = [19.076, 72.8777]

export const CURRENCY = "INR"

export const CITY_PLACEHOLDER = "e.g., Mumbai, Delhi, Bangalore"

export const SERVICE_CATEGORIES = [
  "Wedding Venues",
  "Photographers",
  "Bridal Makeup",
  "Henna Artists",
  "Bridal Wear",
  "Car Rental",
  "Wedding Cards",
]

export const categoryFromPathParam = (pathSegment) => {
  if (!pathSegment) return null
  const decoded = decodeURIComponent(pathSegment).replace(/-/g, " ")
  return (
    SERVICE_CATEGORIES.find((c) => c.toLowerCase() === decoded.toLowerCase()) || decoded
  )
}
