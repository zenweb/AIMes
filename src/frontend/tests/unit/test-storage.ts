import { vi } from 'vitest'

export function installMemoryLocalStorage() {
  const storage = new Map<string, string>()
  const localStorageStub: Storage = {
    get length() {
      return storage.size
    },
    clear() {
      storage.clear()
    },
    getItem(key: string) {
      return storage.get(key) ?? null
    },
    key(index: number) {
      return Array.from(storage.keys())[index] ?? null
    },
    removeItem(key: string) {
      storage.delete(key)
    },
    setItem(key: string, value: string) {
      storage.set(key, value)
    },
  }

  vi.stubGlobal('localStorage', localStorageStub)
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageStub,
  })
}
