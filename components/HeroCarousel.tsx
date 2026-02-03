'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const heroImages = [
  { src: '/hero-1.jpg', alt: 'Snowy coastal sunset with dock' },
  { src: '/hero-2.jpg', alt: 'Waterfront view with oak trees' },
  { src: '/hero-3.jpg', alt: 'Twilight over the water' },
  { src: '/hero-4.jpg', alt: 'Historic lighthouse tower' },
  { src: '/hero-5.jpg', alt: 'Waterfront home with porch' },
  { src: '/hero-6.jpg', alt: 'Aerial marsh and waterway view' },
  { src: '/hero-7.jpg', alt: 'Coastal bay with fence' },
  { src: '/hero-8.jpg', alt: 'Marina sunset with boats' },
  { src: '/hero-9.jpg', alt: 'Marina sunset silhouette' },
]

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Images */}
      {heroImages.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      
      {/* Content */}
      <div className="absolute bottom-12 left-0 right-0 text-center text-white px-4">
        <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
          Discover Coastal Carolina Living
        </h2>
        <p className="text-2xl mb-8 drop-shadow-md">
          Your trusted guide to homes in Southeastern North Carolina
        </p>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
