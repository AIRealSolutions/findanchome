'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Hero images with links - some link to properties, some to community/area pages
const heroImages = [
  { src: '/hero-1.jpg', alt: 'Snowy coastal sunset with dock', link: '/communities/southport', type: 'area' },
  { src: '/hero-2.jpg', alt: 'Waterfront view with oak trees', link: '/communities/wilmington', type: 'area' },
  { src: '/hero-3.jpg', alt: 'Twilight over the water', link: '/communities/oak-island', type: 'area' },
  { src: '/hero-4.jpg', alt: 'Historic lighthouse tower', link: '/communities/southport', type: 'area' },
  { src: '/hero-5.jpg', alt: 'Waterfront home with porch', link: '/properties', type: 'property' },
  { src: '/hero-6.jpg', alt: 'Aerial marsh and waterway view', link: '/communities/wilmington', type: 'area' },
  { src: '/hero-7.jpg', alt: 'Coastal bay with fence', link: '/communities/oak-island', type: 'area' },
  { src: '/hero-8.jpg', alt: 'Marina sunset with boats', link: '/communities/southport', type: 'area' },
  { src: '/hero-9.jpg', alt: 'Marina sunset silhouette', link: '/communities/wilmington', type: 'area' },
  { src: '/hero-img8441.jpeg', alt: 'Beautiful coastal home with wrap-around porch', link: '/properties', type: 'property' },
  { src: '/hero-img3688.jpeg', alt: 'Stunning NC sunset over marshland', link: '/communities', type: 'area' },
  { src: '/hero-img7296.jpeg', alt: 'Spacious ranch home with large yard', link: '/properties', type: 'property' },
  { src: '/hero-img7199.jpeg', alt: 'Golf course community clubhouse', link: '/communities', type: 'area' },
  { src: '/hero-img7031.jpeg', alt: 'Charming country home with front porch', link: '/properties', type: 'property' },
  { src: '/hero-img7021.jpeg', alt: 'Rural property with spacious lot', link: '/properties', type: 'property' },
  { src: '/hero-img7024.jpeg', alt: 'Ranch-style home with metal roof', link: '/properties', type: 'property' },
]

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const currentImage = heroImages[currentIndex]

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Images */}
      {heroImages.map((image, index) => (
        <Link 
          key={image.src}
          href={image.link}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </Link>
      ))}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
      
      {/* Content */}
      <div className="absolute bottom-12 left-0 right-0 text-center text-white px-4 pointer-events-none">
        <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
          Discover Your North Carolina Home
        </h2>
        <p className="text-2xl mb-2 drop-shadow-md">
          From the Coast to the Mountains - We're Here to Help
        </p>
        <p className="text-lg opacity-90 drop-shadow-md">
          {currentImage.type === 'property' ? 'Click to explore properties' : 'Click to explore communities'}
        </p>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
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
