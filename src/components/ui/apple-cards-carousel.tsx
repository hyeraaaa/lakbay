"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Image, { ImageProps } from "next/image";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface CarouselProps {
  items: React.ReactElement[];
  initialScroll?: number;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

type Card = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

type ReactElementType = React.ElementType & {
  name?: string;
  displayName?: string;
};

export const Carousel = ({ items, initialScroll = 0, onLoadMore, hasMore = false, isLoadingMore = false }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const checkScrollability = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const tolerance = 2; // Increased tolerance for better detection
      setCanScrollLeft(scrollLeft > tolerance);
      
      // More precise check for right scrolling
      const maxScroll = scrollWidth - clientWidth;
      const canScroll = scrollLeft < maxScroll - tolerance;
      setCanScrollRight(canScroll);
    }
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll, checkScrollability]);

  useEffect(() => {
    const handleResize = () => {
      checkScrollability();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollability]);

  // Handle loading more items when scrolling to the end
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    checkScrollability();
    
    // Additional check to immediately disable right button when at end
    const target = e.target as HTMLDivElement;
    const { scrollLeft, scrollWidth, clientWidth } = target;
    const maxScroll = scrollWidth - clientWidth;
    
    if (scrollLeft >= maxScroll - 2) {
      setCanScrollRight(false);
      
      // Trigger loading more items if we're at the end and have more to load
      if (hasMore && onLoadMore && !isLoadingMore) {
        onLoadMore();
      }
    }
  }, [checkScrollability, hasMore, onLoadMore, isLoadingMore]);

  const scrollLeft = () => {
    if (carouselRef.current && canScrollLeft) {
      // Calculate how many cards are visible on screen
      const isMobileView = window.innerWidth < 768;
      const cardWidth = isMobileView ? 224 : 256; // w-56 (224px) or md:w-64 (256px)
      const gap = 16; // gap-4 (16px)
      const containerWidth = carouselRef.current.clientWidth;
      const padding = 32; // Account for pl-4 (16px) and pr padding
      const availableWidth = containerWidth - padding;
      
      // Calculate how many cards fit in the visible area
      const cardsPerView = Math.floor(availableWidth / (cardWidth + gap));
      const scrollDistance = (cardWidth + gap) * Math.max(1, cardsPerView);
      
      carouselRef.current.scrollBy({ left: -scrollDistance, behavior: "smooth" });
      // Check scrollability after a short delay to account for smooth scrolling
      setTimeout(checkScrollability, 100);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current && canScrollRight) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      // Double-check if we can actually scroll (prevent edge case clicks)
      if (scrollLeft >= maxScroll - 2) {
        setCanScrollRight(false);
        return;
      }
      
      // Calculate how many cards are visible on screen
      const isMobileView = window.innerWidth < 768;
      const cardWidth = isMobileView ? 224 : 256; // w-56 (224px) or md:w-64 (256px)
      const gap = 16; // gap-4 (16px)
      const containerWidth = carouselRef.current.clientWidth;
      const padding = 32; // Account for pl-4 (16px) and pr padding
      const availableWidth = containerWidth - padding;
      
      // Calculate how many cards fit in the visible area
      const cardsPerView = Math.floor(availableWidth / (cardWidth + gap));
      const scrollDistance = (cardWidth + gap) * Math.max(1, cardsPerView);
      
      const nextScrollPosition = scrollLeft + scrollDistance;
      
      // Only scroll if we won't exceed the maximum scroll position
      if (nextScrollPosition <= maxScroll) {
        carouselRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
      } else {
        // Scroll to the exact end position
        carouselRef.current.scrollTo({ left: maxScroll, behavior: "smooth" });
      }
      
      // Immediately disable the button if we're at or will reach the end
      if (nextScrollPosition >= maxScroll - 2) {
        setCanScrollRight(false);
      }
      
      // Also check scrollability after a short delay to account for smooth scrolling
      setTimeout(checkScrollability, 100);
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return window && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-5 [scrollbar-width:none] md:py-10"
          ref={carouselRef}
          onScroll={handleScroll}
        >
          <div
            className={cn(
              "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l"
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              "mx-auto max-w-7xl" // remove max-w-4xl if you want the carousel to span the full width of its container
            )}
          >
            {items.map((item, index) => {
              // Determine if this is a SkeletonCard
              let isSkeleton = false;
              if (item && item.type) {
                const type = item.type as ReactElementType;
                isSkeleton = type.name === 'SkeletonCard' || type.displayName === 'SkeletonCard';
              }
              return (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      delay: isSkeleton ? 0 : 0.2 * index, // No delay for skeletons
                      ease: "easeOut",
                    },
                  }}
                  key={"card" + index}
                  className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
                >
                  {item}
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="mr-10 flex justify-end gap-2">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight || isLoadingMore}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  useOutsideClick(containerRef as React.RefObject<HTMLDivElement>, () =>
    handleClose()
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    onCardClose(index);
  }, [setOpen, onCardClose, index]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-neutral-900"
            >
              <button
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
                onClick={handleClose}
              >
                <IconX className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-black dark:text-white"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white"
              >
                {card.title}
              </motion.p>
              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-[40rem] md:w-96 dark:bg-neutral-900"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        <div className="relative z-40 p-8">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-sm font-medium text-white md:text-base"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-2 max-w-xs text-left font-sans text-xl font-semibold [text-wrap:balance] text-white md:text-3xl"
          >
            {card.title}
          </motion.p>
        </div>
        <BlurImage
          src={card.src}
          alt={card.title}
          fill
          className="absolute inset-0 z-10 object-cover"
        />
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "h-full w-full transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  );
};
