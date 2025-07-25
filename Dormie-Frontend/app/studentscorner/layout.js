"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { User, FileText, DollarSign, LogOut, X, Menu, MessageSquare, AlertTriangle, Search, UserCheck, Home } from "lucide-react"

export default function StudentsCorner({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) {
      setUserName(name)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("userName")
    localStorage.removeItem("userId")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRoles")
    router.push("/login")
  }

  const menuItems = [
    {
      href: "/studentscorner",
      label: "My Information",
      icon: User,
      active: pathname === "/studentscorner",
    },
    {
      href: "/studentscorner/apply",
      label: "Apply For Seat",
      icon: FileText,
      active: pathname === "/studentscorner/apply",
    },
    {
      href: "/studentscorner/mydues",
      label: "My Dues",
      icon: DollarSign,
      active: pathname === "/studentscorner/mydues",
    },
    {
      href: "/studentscorner/complaints",
      label: "All Complaints",
      icon: MessageSquare,
      active: pathname === "/studentscorner/complaints" && !pathname.includes("/my-reports"),
    },
    {
      href: "/studentscorner/complaints/my-reports",
      label: "My Reports",
      icon: UserCheck,
      active: pathname.includes("/my-reports"),
    },
    {
      href: "/studentscorner/room-change",
      label: "Room Change",
      icon: Home,
      active: pathname === "/studentscorner/room-change",
    },

  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-red-800 text-white rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 
        bg-gradient-to-b from-red-800 to-red-900 text-white 
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        flex flex-col shadow-xl
      `}
      >
        {/* User Profile Section */}
        <div className="p-6 border-b border-red-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Welcome</h3>
              <p className="text-red-200 text-sm">{userName || "Student"}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="text-xl font-bold mb-8 text-center">Student Corner</div>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      item.active ? "bg-red-600 shadow-lg" : "hover:bg-red-700 hover:shadow-md"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-red-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-red-900 hover:bg-red-800 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
