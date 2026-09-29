// Shared TypeScript types for Kirov packages (web + mobile + worker)
export type Role = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "DISPATCHER" | "DRIVER" | "CUSTOMER";

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
};

export type BookingStatus =
  | "QUOTE_REQUESTED"
  | "QUOTE_SENT"
  | "BOOKING_CONFIRMED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_EN_ROUTE"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
  | "RESCHEDULED";

export type FeatureFlags = {
  FEATURE_AI_ASSISTANT: boolean;
  FEATURE_LIVE_TRACKING: boolean;
  FEATURE_PAYMENTS: boolean;
  FEATURE_DRIVER_APP: boolean;
};