import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiBook, FiUsers, FiCheckSquare, FiFileText, FiCalendar, FiClock, FiArrowRight, FiAward, FiTrendingUp, FiBookOpen } from 'react-icons/fi'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/teacher/dashboard')
      const data = response.data.data || response.data
      setStats(data.statistics || data.stats)
      setClasses(data.classes || [])
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Class color gradients
  const gradients = [
    'from-indigo-600 to-purple-600',
    'from-emerald-600 to-teal-600',
    'from-blue-600 to-cyan-600',
    'from-orange-600 to-amber-600',
    'from-pink-600 to-rose-600',
    'from-violet-600 to-fuchsia-600',
  ]

  // Activity data
  const weeklyActivity = [
    { day: 'Mon', submissions: 12, grades: 8 },
    { day: 'Tue', submissions: 15, grades: 10 },
    { day: 'Wed', submissions: 8, grades: 12 },
    { day: 'Thu', submissions: 20, grades: 15 },
    { day: 'Fri', submissions: 18, grades: 14 },
    { day: 'Sat', submissions: 5, grades: 8 },
    { day: 'Sun', submissions: 3, grades: 4 },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage your classes and track student progress</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-xl">
            <FiCalendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard 
            title="My Classes" 
            value={stats?.classCount || classes.length || 3} 
            icon={FiBook} 
            color="indigo"
            change={5}
            subtitle="Active courses"
          />
          <StatCard 
            title="Total Students" 
            value={stats?.studentCount || 43} 
            icon={FiUsers} 
            color="green"
            change={12}
            subtitle="Enrolled students"
          />
          <StatCard 
            title="Active Quizzes" 
            value={stats?.quizCount || 5} 
            icon={FiCheckSquare} 
            color="purple"
            change={8}
            subtitle="Pending evaluation"
          />
          <StatCard 
            title="Assignments" 
            value={stats?.assignmentCount || 6} 
            icon={FiFileText} 
            color="orange"
            change={15}
            subtitle="Tasks created"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-emerald-400" />
              Weekly Activity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="submissions" stroke="#6366f1" fillOpacity={1} fill="url(#colorSubmissions)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-amber-400" />
              Quick Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <FiCheckSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Quizzes to Grade</p>
                    <p className="text-sm text-slate-400">Pending evaluations</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-400">12</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Assignment Submissions</p>
                    <p className="text-sm text-slate-400">New submissions</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-indigo-400">28</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FiBookOpen className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Materials Uploaded</p>
                    <p className="text-sm text-slate-400">Learning resources</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-400">8</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Classes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiBook className="w-5 h-5 text-indigo-400" />
              My Classes
            </h2>
            <span className="text-sm text-slate-400">{classes.length || 3} Active Classes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(classes.length > 0 ? classes : [
              { _id: '1', classname: 'Software Engineering', description: 'Introduction to Software Engineering concepts, methodologies, and best practices for developing quality software.', semester: 'Fall 2024', students: Array(15) },
              { _id: '2', classname: 'Database Systems', description: 'Learn about relational databases, SQL, normalization, and database design principles.', semester: 'Fall 2024', students: Array(12) },
              { _id: '3', classname: 'Web Engineering', description: 'Modern web development including frontend, backend, and full-stack technologies.', semester: 'Fall 2024', students: Array(16) },
            ]).map((cls, index) => (
              <div key={cls._id} className="group bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
                <div className={`h-28 bg-gradient-to-r ${gradients[index % gradients.length]} relative`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                      {cls.semester || 'Fall 2024'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {cls.classname}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {cls.description?.slice(0, 100) || 'Software Engineering course content'}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-400">{cls.students?.length || 15} students</span>
                    </div>
                    <button className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                      View <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
