/**
 * Utility functions for secure error handling
 * Never expose detailed error information to production users
 */

/**
 * Maps database/API error codes to user-friendly messages
 */
export function getUserFriendlyError(error: any): string {
  if (!error) return "An error occurred. Please try again.";

  // Common Supabase/Postgres error codes
  const errorCode = error.code || error.error_code;
  
  switch (errorCode) {
    case "23505": // unique_violation
      return "This item already exists.";
    case "23503": // foreign_key_violation
      return "This item cannot be modified because it is referenced elsewhere.";
    case "42501": // insufficient_privilege
      return "You do not have permission to perform this action.";
    case "PGRST116": // Row not found
      return "The requested item was not found.";
    case "PGRST301": // Row Level Security violation
      return "Access denied.";
    case "23514": // check_violation
      return "Invalid data provided.";
    default:
      break;
  }

  // Auth-related errors
  const errorMessage = error.message?.toLowerCase() || "";
  
  if (errorMessage.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (errorMessage.includes("email not confirmed")) {
    return "Please verify your email address before signing in.";
  }
  if (errorMessage.includes("user not found")) {
    return "Account not found.";
  }
  if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
    return "Too many attempts. Please try again later.";
  }
  if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
    return "Network error. Please check your connection.";
  }

  return "An error occurred. Please try again.";
}

/**
 * Logs errors only in development environment
 * Use this instead of console.error for secure logging
 */
export function logError(context: string, error: any): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  // In production, errors could be sent to a server-side logging service
  // Example: sendToErrorTracking({ context, error, timestamp: new Date() });
}
