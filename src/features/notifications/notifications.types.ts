/** A notification as consumed by the UI (mapped from the DB row). */
export interface Notification {
  id: number
  title: string
  message: string
  /** Domain category (e.g. 'maintenance'), not a severity. */
  type: string
  isRead: boolean
  createdAt: string
}
