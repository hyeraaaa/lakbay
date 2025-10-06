"use client"

interface ReviewNotesProps {
  notes?: string | null
  reviewed_at?: string | null
  reviewed_by_name?: string | null
  reviewed_by?: string | null
}

export default function ReviewNotes({
  notes,
  reviewed_at,
  reviewed_by_name,
  reviewed_by,
}: ReviewNotesProps) {
  if (!notes) {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Review Notes</h3>
      <p className="text-sm text-gray-700">{notes}</p>
      {reviewed_at && (
        <p className="text-xs text-gray-500 mt-2">
          Reviewed on {new Date(reviewed_at).toLocaleDateString()} by{" "}
          {reviewed_by_name || reviewed_by}
        </p>
      )}
    </div>
  )
}
