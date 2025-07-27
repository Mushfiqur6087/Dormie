"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { User, FileText, DollarSign, LogOut, X, Menu, MessageSquare, AlertTriangle, Search, UserCheck, Home, ChefHat, UtensilsCrossed } from "lucide-react"
import { createApiUrl } from "../../lib/api"

export default function StudentsCorner({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isActiveMessManager, setIsActiveMessManager] = useState(false)
  const [checkingManagerStatus, setCheckingManagerStatus] = useState(true)

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) {
      setUserName(name)
    }
    checkMessManagerStatus()
  }, [])

  const checkMessManagerStatus = async () => {
    const jwtToken = localStorage.getItem("jwtToken")
    const studentId = localStorage.getItem("userId")

    if (!jwtToken || !studentId) {
      setCheckingManagerStatus(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl(`/api/mess-manager-applications/is-active-manager/${studentId}`), {
        method: "GET",
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        setIsActiveMessManager(data.isActiveManager || false)
      }
    } catch (err) {
      console.error("Error checking mess manager status:", err)
    } finally {
      setCheckingManagerStatus(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("userName")
    localStorage.removeItem("userId")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRoles")
    router.push("/login")
  }

  const baseMenuItems = [
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
      href: "/studentscorner/mess-manager-calls",
      label: "Mess Manager Calls",
      icon: ChefHat,
      active: pathname === "/studentscorner/mess-manager-calls",
    },
    {
      href: "/studentscorner/my-applications",
      label: "My Applications",
      icon: FileText,
      active: pathname === "/studentscorner/my-applications",
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

  // Add mess manager specific menu items if the student is an active mess manager
  const messManagerMenuItems = isActiveMessManager ? [
    {
      href: "/studentscorner/allocate-meals",
      label: "Allocate Meals",
      icon: UtensilsCrossed,
      active: pathname === "/studentscorner/allocate-meals",
    },
  ] : []

  // Combine base menu items with conditional mess manager items
  const menuItems = [...baseMenuItems, ...messManagerMenuItems]

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
              {isActiveMessManager ? <ChefHat className="h-6 w-6" /> : <User className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-lg">Welcome</h3>
              <p className="text-red-200 text-sm">{userName || "Student"}</p>
              {isActiveMessManager && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <ChefHat className="h-3 w-3 mr-1" />
                    Mess Manager
                  </span>
                </div>
              )}
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
