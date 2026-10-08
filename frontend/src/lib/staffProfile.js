// Validation for the staff identity form used at sign-up and in "Edit Profile".

export const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  nicNumber: "",
  address: "",
}

export const cleanPhone = (value = "") => value.trim().replaceAll(/[\s\-()]/g, "")
export const cleanNic = (value = "") => value.trim().toUpperCase()

/** Returns { fieldName: message } for every invalid field (empty object when valid). */
export function validateStaffProfile(data) {
  const errors = {}
  if (!data.firstName.trim()) errors.firstName = "First name is required."
  if (!data.lastName.trim()) errors.lastName = "Last name is required."
  if (!data.email.trim() || !data.email.includes("@")) {
    errors.email = "A valid official email address is required."
  }
  if (!/^[0-9]{10}$/.test(cleanPhone(data.phoneNumber))) {
    errors.phoneNumber = "Phone number must contain exactly 10 digits (e.g. 0771234567)."
  }
  const nic = cleanNic(data.nicNumber)
  if (!nic) {
    errors.nicNumber = "National Identity Card (NIC) number is required."
  } else if (!/^([0-9]{12}|[0-9]{9}V)$/.test(nic)) {
    errors.nicNumber = "NIC must be 12 digits (e.g. 199012345678) or 9 digits followed by 'V' (e.g. 901234567V)."
  }
  if (!data.address.trim()) errors.address = "Residential address is required for official staff records."
  return errors
}

/** Field values ready to send to the API. */
export function toProfilePayload(data) {
  return { ...data, phoneNumber: cleanPhone(data.phoneNumber), nicNumber: cleanNic(data.nicNumber) }
}
