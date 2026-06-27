import FingerprintJS from "@fingerprintjs/fingerprintjs";

const USER_ID_KEY = "userId"

let fingerprintPromise: Promise<string> | null = null

const createFingerprint = async (): Promise<string> => {
  const fingerprintAgent = await FingerprintJS.load()
  const result = await fingerprintAgent.get()

  localStorage.setItem(USER_ID_KEY, result.visitorId)

  return result.visitorId
}

export const tokenStorage = {
  getToken(): Promise<string> {
    const existingToken = localStorage.getItem(USER_ID_KEY)

    if (existingToken) {
      return Promise.resolve(existingToken)
    }

    fingerprintPromise ??= createFingerprint()

    return fingerprintPromise
  },
}