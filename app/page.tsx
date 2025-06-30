
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-8 text-gray-900">
          Welcome to Leila
        </h1>
        <p className="text-xl text-center mb-12 text-gray-600">
          Your AI-powered home service assistant
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link href="/services" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Browse Services</h2>
            <p className="text-gray-600">Explore our wide range of home services</p>
          </Link>
          
          <Link href="/book" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Book Now</h2>
            <p className="text-gray-600">Schedule a service in minutes</p>
          </Link>
          
          <Link href="/profile" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">My Account</h2>
            <p className="text-gray-600">Manage your bookings and profile</p>
          </Link>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-4">
            Say "Hey Leila" to get started with voice booking!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/bookings" className="text-blue-600 hover:underline">
              My Bookings
            </Link>
            <Link href="/reviews" className="text-blue-600 hover:underline">
              Reviews
            </Link>
            <Link href="/status" className="text-blue-600 hover:underline">
              System Status
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
