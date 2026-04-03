import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiLogIn, FiBook, FiShield, FiUsers, FiAward, FiEye, FiEyeOff } from 'react-icons/fi'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }
    
    setIsLoading(true)

    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}!`, {
        icon: '🎓',
        duration: 3000
      })
      navigate(`/${user.role}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/30 flex">
      {/* Left Side - Clean Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-b from-slate-950 via-indigo-950/25 to-slate-950 border-r border-slate-800/60">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-4 mb-16">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                <FiBook className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">EduTrackPro</h1>
                <p className="text-sm text-gray-400">Academic Management Platform</p>
              </div>
            </div>
            
            {/* Main Heading */}
            <div className="max-w-lg">
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Empowering Education<br />
                <span className="text-indigo-400">Through Technology</span>
              </h2>
              <p className="text-slate-500 text-base leading-relaxed">
                A modern platform designed to manage academic operations, coursework,
                assessments, and performance in one unified system.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#1a1a24] rounded-xl p-5 border border-[#2a2a3a]">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-3">
                  <FiUsers className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-white">43+</p>
                <p className="text-slate-500 text-sm">Active Students</p>
              </div>
              <div className="bg-[#1a1a24] rounded-xl p-5 border border-[#2a2a3a]">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-3">
                  <FiAward className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">5+</p>
                <p className="text-slate-500 text-sm">Expert Faculty</p>
              </div>
              <div className="bg-[#1a1a24] rounded-xl p-5 border border-[#2a2a3a]">
                <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-3">
                  <FiBook className="w-5 h-5 text-violet-400" />
                </div>
                <p className="text-2xl font-bold text-white">8+</p>
                <p className="text-slate-500 text-sm">SE Courses</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <FiShield className="w-4 h-4" />
              <span>© 2025 EduTrackPro. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center">
              <FiBook className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">EduTrackPro</h1>
              <p className="text-sm text-gray-400">Academic Management Platform</p>
            </div>
          </div>

          <div className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl p-8 sm:p-10 border border-slate-800/60">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-500">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiLogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#1e1e2e]">
              <p className="text-center text-slate-600 text-sm">
                Contact your administrator if you don't have access credentials.
              </p>
            </div>
          </div>

          {/* Footer for Mobile */}
          <p className="lg:hidden text-center text-slate-700 text-xs mt-6">
            © 2025 EduTrackPro – Academic Management Platform
          </p>
        </div>
      </div>
    </div>
  )
}
