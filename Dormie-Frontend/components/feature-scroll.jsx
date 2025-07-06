"use client"

import { useRef } from "react"
import Image from "next/image"

export default function FeatureScroll() {
  const scrollRef = useRef(null)

  const features = [
    {
      id: 1,
      title: "Smart Seat Allocation",
      description:
        "AI-powered room assignment system that considers student preferences, academic year, and compatibility for optimal living arrangements.",
      image: "/images/seat-allocation.png",
      color: "from-blue-500 to-cyan-500",
      icon: "🏠",
    },
    {
      id: 2,
      title: "Digital Fee Management",
      description:
        "Seamless online payment system with automatic receipt generation, payment history tracking, and due date reminders.",
      image: "/images/fee-management.png",
      color: "from-green-500 to-emerald-500",
      icon: "💳",
    },
    {
      id: 3,
      title: "24/7 Complaint System",
      description:
        "Real-time issue reporting and tracking system with instant notifications to hall authorities and status updates.",
      image: "/images/complaint-system.png",
      color: "from-purple-500 to-pink-500",
      icon: "📝",
    },
    {
      id: 4,
      title: "Community Hub",
      description:
        "Connect with fellow residents, join study groups, participate in hall events, and build lasting friendships.",
      image: "/images/community-hub.png",
      color: "from-orange-500 to-red-500",
      icon: "👥",
    },
    {
      id: 5,
      title: "Security & Safety",
      description:
        "Advanced security features including visitor management, emergency alert systems, and 24/7 monitoring.",
      image: "/images/security-safety.png",
      color: "from-indigo-500 to-blue-500",
      icon: "🔒",
    },
  ]

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Dorm-E Features
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Explore the powerful tools that make dormitory management effortless
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto pb-4 horizontal-scroll"
        style={{ scrollbarWidth: "thin" }}
      >
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex-none w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className={`h-48 bg-gradient-to-br ${feature.color} rounded-t-xl relative overflow-hidden`}>
              <Image
                src={feature.image || "/placeholder.svg"}
                alt={feature.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
              <div className="absolute top-4 right-4 text-3xl bg-white bg-opacity-20 rounded-full p-2 backdrop-blur-sm">
                {feature.icon}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
