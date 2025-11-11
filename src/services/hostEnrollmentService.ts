import { apiRequest, uploadFormData } from "@/lib/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface EnrollmentData {
  request_id: number
  permit_url: string
  status: string
  submitted_at: string
  reviewed_at?: string
  notes?: string
}

class HostEnrollmentService {
  async getCurrentEnrollment(): Promise<EnrollmentData | null> {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/owner-enrollments/me`, {
        method: "GET",
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch enrollment data")
      }

      const data = await response.json()
      // Backend returns null if no enrollment exists, or the enrollment object directly
      return data
    } catch (error) {
      console.error("Error fetching enrollment:", error)
      throw error
    }
  }

  async submitEnrollment(businessPermitFile: File, insuranceFile: File, garageLocationName: string, garageCoordinates?: string | null): Promise<EnrollmentData> {
    try {
      const formData = new FormData()
      formData.append("business_permit", businessPermitFile)
      formData.append("insurance_document", insuranceFile)
      formData.append("garage_location_name", garageLocationName)
      if (garageCoordinates) {
        formData.append("garage_coordinates", garageCoordinates)
      }

      const response = await uploadFormData(`${API_BASE_URL}/api/owner-enrollments`, formData)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to submit enrollment request")
      }

      // Fetch the updated enrollment data
      const updatedEnrollment = await this.getCurrentEnrollment()
      if (!updatedEnrollment) {
        throw new Error("Failed to retrieve updated enrollment data")
      }

      return updatedEnrollment
    } catch (error) {
      console.error("Error submitting enrollment:", error)
      throw error
    }
  }

}

export const hostEnrollmentService = new HostEnrollmentService()
