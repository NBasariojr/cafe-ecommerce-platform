// Single source of truth for all Electron IPC channel names.
// Used in both main process (ipcMain) and renderer (contextBridge / ipcRenderer).
// Never use magic strings in Electron IPC — always reference these constants.

export const IPC_CHANNELS = {
  APP: {
    GET_VERSION:   "app:get-version",
    OPEN_EXTERNAL: "app:open-external",
    QUIT:          "app:quit",
  },

  NOTIFICATIONS: {
    SHOW: "notifications:show",
  },

  PRINT: {
    RECEIPT: "print:receipt",
  },

  ORDERS: {
    SUBSCRIBE:   "orders:subscribe",
    UNSUBSCRIBE: "orders:unsubscribe",
  },

  AUTH: {
    GET_TOKEN:   "auth:get-token",
    SET_TOKEN:   "auth:set-token",
    CLEAR_TOKEN: "auth:clear-token",
  },
} as const

// Derive a union type of all valid channel name strings.
// Useful for typed ipcMain.handle and ipcRenderer.invoke wrappers.
type NestedValues<T> = T extends object
  ? { [K in keyof T]: NestedValues<T[K]> }[keyof T]
  : T

export type IpcChannel = NestedValues<typeof IPC_CHANNELS>