"use client"

import { useState } from "react"

export function useEditMode() {
  const [isEditing, setIsEditing] = useState(false)

  const startEditing = () => setIsEditing(true)
  const stopEditing = () => setIsEditing(false)
  const toggleEditing = () => setIsEditing(!isEditing)

  return {
    isEditing,
    startEditing,
    stopEditing,
    toggleEditing,
  }
}
