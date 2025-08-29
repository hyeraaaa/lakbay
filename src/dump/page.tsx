'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute'
import { useJWT } from '@/contexts/JWTContext'
import { apiRequest, uploadFormData, getAccessToken } from '@/lib/jwt'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AnimatedAlert from '@/components/ui/AnimatedAlert'
import { Pencil } from 'lucide-react'

interface UserProfileResponse {
	user_id: number
	first_name: string
	last_name: string
	username: string
	email: string
	phone: string
	address_line1: string
	address_line2?: string | null
	city: string
	state: string
	postal_code: string
	country: string
	user_type: string
	is_verified: boolean
	profile_picture?: string | null
}

interface ProfileFormData {
	first_name: string
	last_name: string
	username: string
	phone: string
	address_line1: string
	address_line2: string
	city: string
	state: string
	postal_code: string
	country: string
}

const initialFormData: ProfileFormData = {
	first_name: '',
	last_name: '',
	username: '',
	phone: '',
	address_line1: '',
	address_line2: '',
	city: '',
	state: '',
	postal_code: '',
	country: ''
}

export default function Page() {
	const { user, updateUser } = useJWT()
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string>('')
	const [success, setSuccess] = useState<string>('')
	const [formData, setFormData] = useState<ProfileFormData>(initialFormData)
	const [profileData, setProfileData] = useState<UserProfileResponse | null>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [previewUrl, setPreviewUrl] = useState<string>('')

	const API_BASE_URL = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || '', [])

	useEffect(() => {
		const fetchProfile = async () => {
			if (!user?.id) return
			setIsLoading(true)
			setError('')
			try {
				const response = await apiRequest(`${API_BASE_URL}/api/users/${user.id}`, { method: 'GET' })
				const data: UserProfileResponse = await response.json()

				setProfileData(data)
				setFormData({
					first_name: data.first_name || '',
					last_name: data.last_name || '',
					username: data.username || '',
					phone: data.phone || '',
					address_line1: data.address_line1 || '',
					address_line2: data.address_line2 || '',
					city: data.city || '',
					state: data.state || '',
					postal_code: data.postal_code || '',
					country: data.country || '' 
				})
			} catch (err: any) {
				setError(err?.message || 'Failed to load profile')
			} finally {
				setIsLoading(false)
			}
		}

		fetchProfile()
	}, [API_BASE_URL, user?.id])

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user?.id) return

		setIsSaving(true)
		setError('')
		setSuccess('')

		try {
			const response = await apiRequest(`${API_BASE_URL}/api/users/${user.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})

			if (!response.ok) {
				const data = await response.json().catch(() => null)
				throw new Error(data?.message || 'Failed to update profile')
			}

			// If a profile image was selected, upload it as part of saving changes
			if (selectedFile) {
				const form = new FormData()
				form.append('profile_picture', selectedFile)

				// Use direct fetch to avoid any structuredClone issues
				const accessToken = getAccessToken()
				if (!accessToken) {
					throw new Error('No access token available')
				}

				const uploadResponse = await fetch(`${API_BASE_URL}/api/users/${user.id}/profile-picture`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${accessToken}`
					},
					body: form
				})

				if (!uploadResponse.ok) {
					const data = await uploadResponse.json().catch(() => null)
					throw new Error(data?.message || 'Failed to upload profile picture')
				}
			}

			setSuccess(selectedFile ? 'Profile and photo updated successfully' : 'Profile updated successfully')
			// Refresh profile info (after both profile update and optional photo upload)
			const refreshed = await apiRequest(`${API_BASE_URL}/api/users/${user.id}`, { method: 'GET' })
			const refreshedData: UserProfileResponse = await refreshed.json()
			setProfileData(refreshedData)
			setSelectedFile(null)
			// Update auth context so Navbar reflects changes immediately
			updateUser({
				first_name: refreshedData.first_name,
				last_name: refreshedData.last_name,
				user_type: refreshedData.user_type,
				is_verified: refreshedData.is_verified,
				email: refreshedData.email,
				id: String(refreshedData.user_id),
			})
		} catch (err: any) {
			setError(err?.message || 'Failed to update profile')
		} finally {
			setIsSaving(false)
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null
		setSelectedFile(file)
		if (file) {
			const url = URL.createObjectURL(file)
			setPreviewUrl(url)
		} else {
			setPreviewUrl('')
		}
	}

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl)
		}
	}, [previewUrl])

	const computedAvatarSrc = React.useMemo(() => {
		if (profileData?.profile_picture) {
			const path = profileData.profile_picture.startsWith('http')
				? profileData.profile_picture
				: `${API_BASE_URL}/${profileData.profile_picture}`.replace(/\\/g, '/')
			return path
		}
		return ''
	}, [API_BASE_URL, profileData?.profile_picture])

	return (
		<AuthenticatedRoute>
			<div className="min-h-screen bg-gray-50">
				<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
					{error && (
						<AnimatedAlert
							message={error}
							variant="destructive"
							position="bottom-right"
							onClose={() => setError('')}
						/>
					)}
					{success && (
						<AnimatedAlert
							message={success}
							variant="default"
							position="bottom-right"
							onClose={() => setSuccess('')}
						/>
					)}
					<div className="px-4 py-6 sm:px-0">
						<Card className="relative">
							<CardHeader className="border-b pt-8">
								<CardTitle>Profile</CardTitle>
								<CardDescription>Avatar, status, and personal details</CardDescription>
							</CardHeader>
							<CardContent className="pb-6">
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
									<div className="lg:col-span-1">
										<div className="flex flex-col items-center gap-4">
											<button
												type="button"
												aria-label="Change profile picture"
												onClick={() => { if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click() } }}
												className="relative group h-28 w-28 lg:h-32 lg:w-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 cursor-pointer ring-1 ring-transparent transition-all hover:ring-blue-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
											>
												{(previewUrl || computedAvatarSrc) ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img src={previewUrl || computedAvatarSrc} alt="Profile" className="h-full w-full object-cover" />
												) : (
													<span className="text-4xl">👤</span>
												)}
												<div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition flex items-center justify-center">
													<Pencil className="h-5 w-5 text-white" />
												</div>
											</button>
											<div className="text-center">
												<div className="text-lg font-medium text-gray-900">
													{profileData ? `${profileData.first_name} ${profileData.last_name}` : '—'}
												</div>
												<div className="text-sm text-gray-500">{profileData?.email || user?.email}</div>
												<div className="mt-1 inline-flex items-center gap-2">
													<span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
														{profileData?.user_type || user?.user_type || 'user'}
													</span>
													{profileData?.is_verified ? (
														<span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Verified</span>
													) : (
														<span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">Not verified</span>
													)}
												</div>
											</div>
											<div className="mt-2 flex items-center justify-center gap-3">
												<input
													ref={fileInputRef}
													type="file"
													accept="image/*"
													onChange={handleFileChange}
													className="hidden"
												/>
												<Button
													type="button"
													onClick={() => { if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click() } }}
													disabled={isSaving}
													variant="outline"
													className="flex items-center gap-2"
												>
													{selectedFile ? 'Select an image' : 'Select an image'}
												</Button>
											</div>
										</div>
									</div>
									<div className="lg:col-span-2">
										{isLoading ? (
											<div className="text-sm text-gray-500">Loading profile...</div>
										) : (
											<form onSubmit={handleSubmit} className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<label className="block text-sm font-medium text-gray-700">First name</label>
														<Input
															name="first_name"
															type="text"
															value={formData.first_name}
															onChange={handleInputChange}
															placeholder="Juan"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700">Last name</label>
														<Input
															name="last_name"
															type="text"
															value={formData.last_name}
															onChange={handleInputChange}
															placeholder="Dela Cruz"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700">Username</label>
														<Input
															name="username"
															type="text"
															value={formData.username}
															onChange={handleInputChange}
															placeholder="juandelacruz"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700">Phone</label>
														<Input
															name="phone"
															type="tel"
															value={formData.phone}
															onChange={handleInputChange}
															placeholder="+63917xxxxxxx"
														/>
													</div>
													<div className="md:col-span-2">
														<label className="block text-sm font-medium text-gray-700">Address line 1</label>
														<Input
															name="address_line1"
															type="text"
															value={formData.address_line1}
															onChange={handleInputChange}
															placeholder="123 Main St"
														/>
													</div>
													<div className="md:col-span-2">
														<label className="block text-sm font-medium text-gray-700">Address line 2</label>
														<Input
															name="address_line2"
															type="text"
															value={formData.address_line2}
															onChange={handleInputChange}
															placeholder="Unit / Floor"
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700">City</label>
														<Input
															name="city"
															type="text"
															value={formData.city}
															onChange={handleInputChange}
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700">State / Province</label>
														<Input
															name="state"
															type="text"
															value={formData.state}
															onChange={handleInputChange}
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700">Postal code</label>
														<Input
															name="postal_code"
															type="text"
															value={formData.postal_code}
															onChange={handleInputChange}
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700">Country</label>
														<Input
															name="country"
															type="text"
															value={formData.country}
															onChange={handleInputChange}
														/>
													</div>
												</div>

											<div className="flex items-center justify-end gap-3 pt-2">
												<Button type="submit" disabled={isSaving}>
													{isSaving ? 'Save changes' : 'Save changes'}
												</Button>
											</div>

											{/* API messages moved to AnimatedAlert outside the card */}
										</form>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</main>
			</div>
			</AuthenticatedRoute>
	)
} 