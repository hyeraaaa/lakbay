import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Star, Heart, Building, Tag, Users, Fuel, Settings } from "lucide-react"

interface CarCardProps {
    carName: string;
    location: string;
    hostName: string;
    price: number;
    rating: number;
    reviewCount: number;
    year: number;
    transmission: string;
    fuelType: string;
    seats: number;
    imageUrl?: string;
    isFavorite?: boolean;
    onFavoriteToggle?: () => void;
}

const CarCard = ({ 
    carName, 
    location, 
    hostName, 
    price, 
    rating, 
    reviewCount, 
    year, 
    transmission, 
    fuelType, 
    seats, 
    imageUrl, 
    isFavorite = false,
    onFavoriteToggle 
}: CarCardProps) => {
    return (
        <Card className="w-full max-w-3xl h-[170px] mx-auto overflow-hidden relative">
            {/* Heart Icon - Top Right */}
            <div className="absolute top-2 right-2 z-10">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-red-50"
                    onClick={onFavoriteToggle}
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`} />
                </Button>
            </div>
            
            <CardContent className="p-0">
                <div className="flex">
                    {/* Left side - Image */}
                    <div className="w-[35%] h-[170px] bg-gray-200 flex items-center justify-center">
                        {imageUrl ? (
                            <img src={imageUrl} alt={carName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-500">Car Image</div>
                        )}
                    </div>
                    
                    {/* Middle - Details */}
                    <div className="w-[50%] p-3">
                        <div className="space-y-2">
                            {/* Car Name */}
                            <h3 className="text-lg font-semibold text-gray-900">{carName}</h3>
                            
                            {/* Location */}
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{location}</span>
                            </div>
                            
                            {/* Host Name */}
                            <div className="flex items-center text-sm text-gray-600">
                                <Building className="w-4 h-4 mr-1" />
                                <span>Hosted by {hostName}</span>
                            </div>
                            
                            {/* Additional Car Details */}
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="flex items-center text-xs text-gray-500">
                                    <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                                    <span>{rating} ({reviewCount} reviews)</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Settings className="w-3 h-3 mr-1" />
                                    <span>{transmission}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Fuel className="w-3 h-3 mr-1" />
                                    <span>{fuelType}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Users className="w-3 h-3 mr-1" />
                                    <span>{seats} Seats</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side - Price */}
                    <div className="w-[15%] p-3 flex flex-col items-end justify-center">
                        <div className="text-right">
                            <div className="text-lg font-bold text-black-600">₱{price.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">per day</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CarCard;
