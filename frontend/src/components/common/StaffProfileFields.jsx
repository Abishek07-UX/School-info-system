import { CreditCard, Mail, MapPin, Phone, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

function Field({ id, label, icon: Icon, error, hint, children }) {
  return (
    <div className="space-y-1.5" data-field={id}>
      <Label htmlFor={id} className="gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label} <span className="text-danger" aria-hidden>*</span>
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/**
 * The staff identity fields shared by sign-up and Edit Profile. Errors only show for
 * fields in `shown` (touched or submitted), so people aren't scolded while typing.
 */
export function StaffProfileFields({ idPrefix = "", value, onChange, errors = {}, shown = {}, onBlur }) {
  const fieldProps = (name) => {
    const id = `${idPrefix}${name}`
    const error = shown[name] ? errors[name] : null
    return {
      id,
      name,
      required: true,
      value: value[name],
      onBlur: () => onBlur?.(name),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : undefined,
    }
  }
  const errorFor = (name) => (shown[name] ? errors[name] : null)
  const set = (name, v) => onChange({ ...value, [name]: v })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}firstName`} label="First Name" icon={User} error={errorFor("firstName")}>
          <Input type="text" autoComplete="given-name" placeholder="Ruwan" {...fieldProps("firstName")} onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field id={`${idPrefix}lastName`} label="Last Name" icon={User} error={errorFor("lastName")}>
          <Input type="text" autoComplete="family-name" placeholder="Perera" {...fieldProps("lastName")} onChange={(e) => set("lastName", e.target.value)} />
        </Field>
      </div>

      <Field id={`${idPrefix}email`} label="Official Email Address" icon={Mail} error={errorFor("email")}>
        <Input type="email" autoComplete="email" placeholder="ruwan.perera@ascentric.lk" {...fieldProps("email")} onChange={(e) => set("email", e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}phoneNumber`} label="Phone (10 Digits)" icon={Phone} error={errorFor("phoneNumber")} hint="Digits only, e.g. 0771234567">
          <Input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="0771234567"
            {...fieldProps("phoneNumber")}
            onChange={(e) => set("phoneNumber", e.target.value.replace(/[^0-9]/g, ""))}
          />
        </Field>
        <Field id={`${idPrefix}nicNumber`} label="National ID (NIC)" icon={CreditCard} error={errorFor("nicNumber")} hint="12 digits, or 9 digits + V">
          <Input
            type="text"
            placeholder="199012345678 or 901234567V"
            {...fieldProps("nicNumber")}
            onChange={(e) => set("nicNumber", e.target.value.toUpperCase())}
          />
        </Field>
      </div>

      <Field id={`${idPrefix}address`} label="Residential Address" icon={MapPin} error={errorFor("address")}>
        <Textarea rows={3} autoComplete="street-address" placeholder="No. 120, Kandy Road, Colombo" {...fieldProps("address")} onChange={(e) => set("address", e.target.value)} />
      </Field>
    </div>
  )
}
