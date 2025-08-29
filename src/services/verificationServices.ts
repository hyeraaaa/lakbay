import { getAccessToken } from "@/lib/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

export const verificationService = {
  async getStatus() {
    const response = await fetch(`${API_BASE_URL}/api/verification/status`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    })
    if (!response.ok) throw new Error("Failed to fetch verification status")
    return response.json()
  },

  async submit(documentType: string, frontFile: File, backFile: File) {
    const formData = new FormData()
    formData.append("documentType", documentType)
    formData.append("documentFront", frontFile)
    formData.append("documentBack", backFile)

    const response = await fetch(`${API_BASE_URL}/api/verification/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      },
      body: formData
    })

    if (!response.ok) throw new Error(`Verification submission failed: ${response.statusText}`)
    return response.json()
  }
}
