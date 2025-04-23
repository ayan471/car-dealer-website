"use client";
import type { Image as PrismaImage } from "@prisma/client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface ClassifiedCarouselProps {
  images?: PrismaImage[];
}

export const ClassifiedCarousel = ({
  images = [],
}: ClassifiedCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If there are no images, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-3/2 bg-gray-200 rounded-md flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // If there's only one image, just show it without any carousel functionality
  if (images.length === 1) {
    const image = images[0];
    return (
      <div className="relative aspect-3/2 rounded-md overflow-hidden">
        <Image
          src={image.src || "/placeholder.svg"}
          alt={image.alt || "Vehicle image"}
          fill
          className="object-cover"
          quality={75}
          placeholder={image.blurhash ? "blur" : "empty"}
          blurDataURL={image.blurhash}
        />
      </div>
    );
  }

  // For multiple images, implement a simple carousel
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="relative">
      {/* Main image */}
      <div className="relative aspect-3/2 rounded-md overflow-hidden">
        <Image
          src={images[currentIndex].src || "/placeholder.svg"}
          alt={images[currentIndex].alt || "Vehicle image"}
          fill
          className="object-cover"
          quality={75}
          placeholder={images[currentIndex].blurhash ? "blur" : "empty"}
          blurDataURL={images[currentIndex].blurhash}
        />

        {/* Navigation buttons */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={prevImage}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={nextImage}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Thumbnails */}
      <div className="flex mt-2 gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative w-20 h-14 rounded-md overflow-hidden cursor-pointer transition-all ${
              index === currentIndex ? "ring-2 ring-primary" : "opacity-70"
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt || "Thumbnail"}
              fill
              className="object-cover"
              quality={20}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
