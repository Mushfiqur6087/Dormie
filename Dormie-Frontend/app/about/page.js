export default function About() {
  const features = [
    {
      title: "Smart Seat Allocation",
      description:
        "AI-powered room assignment system that considers student preferences, academic year, and compatibility for optimal living arrangements.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
        </svg>
      ),
      color: "bg-blue-500",
    },
    {
      title: "Digital Fee Management",
      description:
        "Seamless online payment system with automatic receipt generation, payment history tracking, and real-time fee notifications.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      color: "bg-green-500",
    },
    {
      title: "24/7 Complaint System",
      description:
        "Real-time issue reporting and tracking system with instant notifications to hall authorities and transparent resolution process.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      color: "bg-purple-500",
    },
  ]

  const additionalFeatures = [
    {
      title: "Community Building",
      description: "Connect with fellow residents through study groups, events, and social activities.",
      icon: "👥",
    },
    {
      title: "Security & Safety",
      description: "Advanced security features including visitor management and emergency alerts.",
      icon: "🔒",
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock technical and administrative support for all residents.",
      icon: "🛟",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="text-green-600 dark:text-green-400">Dorm-E</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Revolutionizing dormitory management with cutting-edge technology, seamless operations, and an enhanced
            student living experience.
          </p>
        </div>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <div className={`${feature.color} p-6 text-white`}>
                <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-lg mb-4 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-center">{feature.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Why Choose Dorm-E?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg leading-relaxed max-w-4xl mx-auto">
            To create a seamless, technology-driven dormitory experience that empowers students to focus on their
            academic journey while fostering a vibrant, supportive community. We believe that where you live should
            enhance your educational experience, not complicate it.
          </p>
        </div>
      </div>
    </div>
  )
}
