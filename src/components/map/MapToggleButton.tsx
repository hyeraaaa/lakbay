import { List, MapPin } from "lucide-react"

type Props = {
  showMap: boolean
  onToggle: () => void
}

export default function MapToggleButton({ showMap, onToggle }: Props) {
  return (
    <div className="lg:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <button
        onClick={onToggle}
        className="bg-white border border-gray-200 shadow-lg text-gray-700 px-6 py-3 rounded-full flex items-center gap-3 transition-all duration-200 hover:shadow-xl"
      >
        {showMap ? (
          <>
            <List className="w-5 h-5" />
            <span className="font-medium">Show Vehicles</span>
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Show Map</span>
          </>
        )}
      </button>
    </div>
  )
}


