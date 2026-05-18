export const mockDelay = <T>(data: T, ms = 220) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))
