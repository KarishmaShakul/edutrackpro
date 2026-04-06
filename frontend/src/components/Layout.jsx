import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import { 
  FiHome, FiUsers, FiBook, FiLogOut, FiMenu, FiX, FiUser,
  FiFileText, FiCheckSquare, FiFolder, FiBarChart2, FiAward, FiBell, FiChevronDown, FiPower
} from 'react-icons/fi'
import { useState } from 'react'

const roleConfigs = {
  admin: {
    title: 'Admin Panel',
    subtitle: 'System Management',
    color: 'bg-gradient-to-r from-slate-800 to-slate-900',
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500',
    links: [
      { path: '/admin', icon: FiHome, label: 'Dashboard' },
      { path: '/admin/teachers', icon: FiUsers, label: 'Teachers' },
      { path: '/admin/students', icon: FiUser, label: 'Students' },
      { path: '/admin/classes', icon: FiBook, label: 'Classes' },
    ]
  },
  teacher: {
    title: 'Teacher Portal',
    subtitle: 'Course Management',
    color: 'bg-gradient-to-r from-slate-800 to-slate-900',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500',
    links: [
      { path: '/teacher', icon: FiHome, label: 'Dashboard' },
      { path: '/teacher/classes', icon: FiBook, label: 'My Classes' },
      { path: '/teacher/attendance', icon: FiUsers, label: 'Attendance' },
      { path: '/teacher/quizzes', icon: FiCheckSquare, label: 'Quizzes' },
      { path: '/teacher/assignments', icon: FiFileText, label: 'Assignments' },
      { path: '/teacher/materials', icon: FiFolder, label: 'Materials' },
      { path: '/teacher/marks', icon: FiAward, label: 'Marks' },
    ]
  },
  student: {
    title: 'Student Portal',
    subtitle: 'Learning Hub',
    color: 'bg-gradient-to-r from-slate-800 to-slate-900',
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500',
    links: [
      { path: '/student', icon: FiHome, label: 'Dashboard' },
      { path: '/student/classes', icon: FiBook, label: 'My Classes' },
      { path: '/student/quizzes', icon: FiCheckSquare, label: 'Quizzes' },
      { path: '/student/assignments', icon: FiFileText, label: 'Assignments' },
      { path: '/student/results', icon: FiBarChart2, label: 'My Results' },
    ]
  },
  head: {
    title: 'HOD Dashboard',
    subtitle: 'Department Overview',
    color: 'bg-gradient-to-r from-slate-800 to-slate-900',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500',
    links: [
      { path: '/head', icon: FiHome, label: 'Dashboard' },
      { path: '/head/classes', icon: FiBook, label: 'All Classes' },
      { path: '/head/results', icon: FiBarChart2, label: 'Results' },
    ]
  }
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  const config = roleConfigs[user?.role] || roleConfigs.student

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Clean Professional Design */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 border-r border-slate-800/60
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Area */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex items-center justify-between">
            <Logo type="full" className="h-8" />
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider px-3 py-2">Navigation</p>
          {config.links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === `/${user?.role}`}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                ${isActive 
                  ? `bg-[#1e1e2e] ${config.accent} border-l-2 border-current` 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e1e2e]/50'}
              `}
            >
              <link.icon className="w-[18px] h-[18px]" />
              <span className="text-sm font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Info */}
        <div className="p-3 border-t border-[#1e1e2e]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-9 h-9 rounded-lg ${config.accentBg} flex items-center justify-center`}>
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar - Professional Header with Sign Out */}
        <header className="bg-gradient-to-r from-slate-950 via-indigo-950/25 to-slate-950 border-b border-slate-800/60 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-[#1e1e2e] transition-colors"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <Logo type="icon" className="w-8 h-8 hidden sm:block" />
            </div>

            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button className="relative p-2 text-slate-400 hover:text-white hover:bg-[#1e1e2e] rounded-lg transition-all">
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Menu with Sign Out */}
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-slate-300 hover:bg-[#1e1e2e] rounded-lg transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg ${config.accentBg} flex items-center justify-center`}>
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg shadow-xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-[#2a2a3a]">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <FiPower className="w-4 h-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-slate-800/60 bg-gradient-to-r from-slate-950 via-indigo-950/25 to-slate-950">
          <p className="text-center text-[11px] text-slate-600">
            © 2025 EduTrackPro. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  )
}
