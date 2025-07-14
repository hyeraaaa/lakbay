import { Container } from "@/components/container";
import { Carousel } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";

const carDeals = [
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
];

const SimpleCard = ({ deal }: { deal: (typeof carDeals)[0] }) => {
  return (
    <div className="relative flex h-64 w-48 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-80 md:w-72 dark:bg-neutral-900">
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
        sizes="(max-width: 768px) 192px, 288px"
        className="absolute inset-0 z-10 object-cover"
        priority={false}
      />
    </div>
  );
};

const CarDeals = () => {
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

        <Carousel
          items={carDeals.map((deal, index) => (
            <SimpleCard key={index} deal={deal} />
          ))}
        />
      </div>
    </Container>
  );
};

export default CarDeals;
