import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type guard for unknown values that are plain objects.
 * Use this to safely access properties on unknown API responses.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Safely coerces a value to a trimmed string, returning null if invalid.
 */
export function coerceString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely parses various date formats (epoch seconds, epoch ms, ISO strings).
 * Returns null instead of Invalid Date on failure.
 *
 * @param value - number (epoch), string (ISO or numeric), or null/undefined
 */
export function safeParseDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null
    // Heuristic: if < 1 trillion, assume seconds; otherwise ms
    const ms = value < 1_000_000_000_000 ? value * 1000 : value
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d
  }

  if (typeof value === "string") {
    const v = value.trim()
    if (!v) return null

    // Numeric string (epoch)
    if (/^\d+$/.test(v)) {
      const n = Number(v)
      if (!Number.isFinite(n) || n <= 0) return null
      const ms = v.length <= 10 ? n * 1000 : n
      const d = new Date(ms)
      return Number.isNaN(d.getTime()) ? null : d
    }

    // ISO or other parseable string
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d
  }

  return null
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
})

/**
 * Formats a date value to a time string (e.g., "10:30 AM").
 * Returns null on invalid input (never shows "Invalid Date").
 */
export function formatTime(value: unknown): string | null {
  const d = safeParseDate(value)
  if (!d) return null
  return timeFormatter.format(d)
}

/**
 * Formats a date value to a full date-time string.
 * Returns null on invalid input.
 */
export function formatDateTime(value: unknown): string | null {
  const d = safeParseDate(value)
  if (!d) return null
  return dateTimeFormatter.format(d)
}

/**
 * Formats a date value to a date string (no time).
 * Returns null on invalid input.
 */
export function formatDate(value: unknown): string | null {
  const d = safeParseDate(value)
  if (!d) return null
  return dateFormatter.format(d)
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting Utilities
// ─────────────────────────────────────────────────────────────────────────────

const FILE_SIZE_UNITS = ["Bytes", "KB", "MB", "GB"] as const

/**
 * Formats a byte count to a human-readable string (e.g., "1.5 MB").
 * Returns "0 Bytes" for zero or invalid input.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes"
  const k = 1024
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    FILE_SIZE_UNITS.length - 1
  )
  const value = bytes / Math.pow(k, i)
  // Use 2 decimal places, but remove trailing zeros
  return `${parseFloat(value.toFixed(2))} ${FILE_SIZE_UNITS[i]}`
}
