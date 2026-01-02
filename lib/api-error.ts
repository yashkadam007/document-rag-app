import axios from "axios"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function coerceString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function normalizeAuthDetail(detail: string): string {
  // Backend (FastAPI) details we know about.
  switch (detail.toLowerCase()) {
    case "invalid credentials":
      return "Invalid email or password."
    case "invalid email":
      return "Please enter a valid email address."
    case "email and password are required":
      return "Please enter your email and password."
    case "account already exists":
      return "An account with this email already exists. Try signing in instead."
    default:
      return detail
  }
}

function extractFastApiDetail(data: unknown): string | null {
  // FastAPI commonly returns: { detail: "..." } or { detail: [{ msg: "...", ... }] }
  if (!isRecord(data)) return null

  const detail = data.detail
  const detailStr = coerceString(detail)
  if (detailStr) return normalizeAuthDetail(detailStr)

  if (Array.isArray(detail)) {
    const messages: string[] = []
    for (const item of detail) {
      if (!isRecord(item)) continue
      const msg = coerceString(item.msg)
      if (msg) messages.push(msg)
    }
    if (messages.length > 0) return messages.join("\n")
  }

  return null
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    // Prefer explicit server detail when available.
    const serverMessage = extractFastApiDetail(error.response?.data)
    if (serverMessage) return serverMessage

    if (status === 401) return "Invalid email or password."
    if (status === 403) return "You don’t have permission to do that."
    if (status === 404) return "That endpoint was not found."
    if (status === 409) return "That account already exists. Try signing in instead."
    if (status === 429) return "Too many attempts. Please wait a moment and try again."

    // Network / CORS / server down.
    if (!error.response) return "Network error. Please check your connection and try again."
  }

  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}


