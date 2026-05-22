/**
 * Utility function to generate WhatsApp links with proper formatting
 *
 * @param {string} phone - Phone number to send WhatsApp message to
 * @param {string} message - Message to pre-populate in WhatsApp
 * @returns {string} Properly formatted WhatsApp link
 */
export const generateWhatsAppLink = (phone, message) => {
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

  let formattedPhone = cleanPhone;
  if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
    formattedPhone = `91${cleanPhone.substring(1)}`;
  } else if (/^[6-9]\d{9}$/.test(cleanPhone)) {
    formattedPhone = `91${cleanPhone}`;
  } else if (!formattedPhone.startsWith("91")) {
    formattedPhone = `91${formattedPhone}`;
  }

  formattedPhone = formattedPhone.replace("+", "");

  const encodedMessage = encodeURIComponent(message || "");
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};
