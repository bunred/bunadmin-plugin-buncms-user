import { request, storedToken, ENV } from "@bunred/bunadmin"

async function verify(): Promise<any> {
  const token = await storedToken()

  // query remote user with token
  return request("/auth/me", {
    prefix: ENV.AUTH_URL,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export default verify
