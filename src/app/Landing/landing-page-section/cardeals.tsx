"use client";
import { Container } from "@/components/container";
import { Carousel } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { vehicleService, type VehicleResponse } from "@/services/vehicleServices";
import { getVehiclePrimaryImageUrl } from "@/lib/imageUtils";
import { encodeId } from "@/lib/idCodec";
import Link from "next/link";

// Tiny 1x1 transparent GIF for lightweight blur placeholder
const BLUR_DATA_URL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

interface CarDeal {
  id?: string;
  src: string;
  title: string;
  category: string;
  price: string;
  location: string;
}

// Fallback data in case API fails
const fallbackCarDeals: CarDeal[] = [
  {
    src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
    title: "Toyota Vios",
    category: "Sedan",
    price: "₱4,500/day",
    location: "Manila",
  },
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
    title: "Honda City",
    category: "Sedan",
    price: "₱4,800/day",
    location: "Cebu",
  },
  {
    src: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop&crop=center",
    title: "Mitsubishi Mirage",
    category: "Hatchback",
    price: "₱3,200/day",
    location: "Davao",
  },
  {
    src: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
    title: "Suzuki Swift",
    category: "Hatchback",
    price: "₱3,500/day",
    location: "Baguio",
  },
  {
    src: "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=400&h=300&fit=crop&crop=center",
    title: "Nissan Almera",
    category: "Sedan",
    price: "₱4,200/day",
    location: "Iloilo",
  },
  {
    src: "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=400&h=300&fit=crop&crop=center",
    title: "Nissan Almera",
    category: "Sedan",
    price: "₱4,200/day",
    location: "Iloilo",
  },
  {
    src: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop&crop=center",
    title: "Mitsubishi Mirage",
    category: "Hatchback",
    price: "₱3,200/day",
    location: "Davao",
  },
  {
    src: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
    title: "Suzuki Swift",
    category: "Hatchback",
    price: "₱3,500/day",
    location: "Baguio",
  },
  {
    src: "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=400&h=300&fit=crop&crop=center",
    title: "Nissan Almera",
    category: "Sedan",
    price: "₱4,200/day",
    location: "Iloilo",
  },
  {
    src: "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=400&h=300&fit=crop&crop=center",
    title: "Nissan Almera",
    category: "Sedan",
    price: "₱4,200/day",
    location: "Iloilo",
  },
];

// Mock API function - replace with your actual API endpoint
const fetchCarDeals = async (page: number, limit: number = 5): Promise<CarDeal[]> => {
  try {
    const vehicles: VehicleResponse[] = await vehicleService.getAllVehicles({
      page,
      limit,
      maxRate: 5000,
      availability: "available",
      sort: "rate_asc",
    });

    // Map backend vehicles to CarDeal UI shape
    const mapped: CarDeal[] = vehicles.map((v) => {
      const src = getVehiclePrimaryImageUrl(v);
      const title = [v.brand, v.model].filter(Boolean).join(" ");
      const category = v.type ? v.type.charAt(0).toUpperCase() + v.type.slice(1) : "Vehicle";
      const price = `₱${Number(v.rate_per_day).toLocaleString("en-PH")}/day`;
      const location = v.garage_location_name || "Pickup location";
      const id = encodeId(String(v.vehicle_id));
      return { id, src, title, category, price, location };
    });

    return mapped;
  } catch (error) {
    console.error("Failed to fetch car deals from API:", error);
    // Graceful fallback to local demo data (paged to match request)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return fallbackCarDeals.slice(startIndex, endIndex);
  }
};

const SkeletonCard = () => {
  return (
    <div className="relative flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-200 animate-pulse md:h-96 md:w-64 dark:bg-neutral-800">
      <div className="relative z-40 p-6 flex flex-col h-full justify-between">
        <div>
          <div className="h-3 w-16 bg-gray-300 rounded mb-2 dark:bg-neutral-700"></div>
          <div className="h-6 w-24 bg-gray-300 rounded mb-1 dark:bg-neutral-700"></div>
        </div>  
        <div>
          <div className="h-6 w-20 bg-gray-300 rounded mb-1 dark:bg-neutral-700"></div>
          <div className="h-3 w-24 bg-gray-300 rounded dark:bg-neutral-700"></div>
        </div>
      </div>
    </div>
  );
};

const SimpleCard = ({ deal, priority = false }: { deal: CarDeal; priority?: boolean }) => {
  const content = (
    <motion.div 
      className="relative flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-96 md:w-64 dark:bg-neutral-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
      <div className="relative z-40 p-6 flex flex-col h-full justify-between">
        <div>
          <p className="text-left font-sans text-xs font-medium text-white md:text-sm">
            {deal.category}
          </p>
          <p className="mt-1 max-w-xs text-left font-sans text-lg font-semibold [text-wrap:balance] text-white md:text-xl">
            {deal.title}
          </p>
        </div>  
        <div className="text-white">
          <p className="text-lg font-bold text-white md:text-xl">
            {deal.price}
          </p>
          <p className="text-xs text-gray-200">Pickup in {deal.location}</p>
        </div>
      </div>
      <Image
        src={deal.src}
        alt={deal.title}
        fill
        sizes="(max-width: 640px) 220px, (max-width: 1024px) 240px, 256px"
        className="absolute inset-0 z-10 object-cover"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        quality={80}
        style={{ objectPosition: "center 65%" }}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
      />
    </motion.div>
  );
  return deal.id ? (
    <Link href={`/user/vehicle/${deal.id}`} className="block">
      {content}
    </Link>
  ) : content;
};

const CarDeals = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [carDeals, setCarDeals] = useState<CarDeal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadInitialCarDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const deals = await fetchCarDeals(1, 5);
        setCarDeals(deals);
        setHasMore(deals.length === 5); // If we get less than 5, we've reached the end
      } catch (err) {
        setError('Failed to load car deals');
        console.error('Error loading car deals:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialCarDeals();
  }, []);

  const loadMoreDeals = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const newDeals = await fetchCarDeals(nextPage, 5);
      
      if (newDeals.length > 0) {
        setCarDeals(prev => [...prev, ...newDeals]);
        setCurrentPage(nextPage);
        setHasMore(newDeals.length === 5); // If we get less than 5, we've reached the end
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more car deals:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderCarouselItems = () => {
    const items = carDeals.map((deal, index) => (
      <SimpleCard key={index} deal={deal} priority={index === 0} />
    ));

    // Add skeleton cards while loading more (show 5 skeletons to match page size)
    if (isLoadingMore) {
      for (let i = 0; i < 5; i++) {
        items.push(<SkeletonCard key={`skeleton-${i}`} />);
      }
    }

    return items;
  };

  return (
    <Container>
      <div>
        <h2 className="text-3xl font-bold tracking-wider text-center">
          Car Deals Under ₱5,000
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
          Discover affordable car rentals perfect for your next adventure. All
          vehicles are well-maintained and come with comprehensive insurance.
        </p>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Carousel
                items={Array.from({ length: 5 }, (_, index) => (
                  <SkeletonCard key={`skeleton-${index}`} />
                ))}
              />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="loaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Carousel
                items={renderCarouselItems()}
                onLoadMore={loadMoreDeals}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Container>
  );
};

export default CarDeals;
