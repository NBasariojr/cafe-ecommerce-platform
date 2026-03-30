import type { NotificationType } from "../enums"

/**
 * An in-app or push notification for a user.
 * Sent via Socket.IO to the user's personal room and stored for inbox display.
 */
export interface Notification {
  id:        string
  userId:    string
  type:      NotificationType
  title:     string
  body:      string
  data?:     Record<string, string>
  isRead:    boolean
  createdAt: string
}