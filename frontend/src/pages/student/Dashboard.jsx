import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiBook, FiCheckSquare, FiFileText, FiAward, FiClock, FiCalendar, FiUser, FiArrowRight, FiTrendingUp, FiTarget, FiBookOpen } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'

export default function StudentDashboard() {
  const [stats, setStats] = useState(null)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/student/dashboard')
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
    'from-emerald-600 to-teal-600',
    'from-indigo-600 to-purple-600',
    'from-blue-600 to-cyan-600',
    'from-orange-600 to-amber-600',
    'from-pink-600 to-rose-600',
  ]

  // Progress data for chart
  const progressData = [
    { name: 'Progress', value: stats?.averageScore || 78, fill: '#10b981' },
  ]

  // Weekly performance data
  const weeklyPerformance = [
    { week: 'W1', score: 72 },
    { week: 'W2', score: 75 },
    { week: 'W3', score: 80 },
    { week: 'W4', score: 78 },
    { week: 'W5', score: 85 },
    { week: 'W6', score: 82 },
  ]

  // Upcoming tasks
  const upcomingTasks = [
    { id: 1, title: 'Database Quiz', type: 'quiz', due: '2 days', subject: 'Database Systems' },
    { id: 2, title: 'SE Assignment 3', type: 'assignment', due: '5 days', subject: 'Software Engineering' },
    { id: 3, title: 'Web Project', type: 'project', due: '1 week', subject: 'Web Engineering' },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
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
            <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
            <p className="text-slate-400 mt-1">Track your progress and upcoming tasks</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-xl">
            <FiCalendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard 
            title="Enrolled Classes" 
            value={stats?.classCount || classes.length || 3} 
            icon={FiBook} 
            color="indigo"
            change={0}
            subtitle="Active courses"
          />
          <StatCard 
            title="Pending Quizzes" 
            value={stats?.pendingQuizzes || 2} 
            icon={FiCheckSquare} 
            color="green"
            subtitle="Due this week"
          />
          <StatCard 
            title="Pending Assignments" 
            value={stats?.pendingAssignments || 3} 
            icon={FiFileText} 
            color="purple"
            subtitle="Tasks remaining"
          />
          <StatCard 
            title="Average Score" 
            value={`${stats?.averageScore || 78}%`} 
            icon={FiAward} 
            color="orange"
            change={5}
            subtitle="Overall performance"
          />
        </div>

        {/* Charts & Tasks Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-emerald-400" />
              Performance Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyPerformance}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[60, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiClock className="w-5 h-5 text-amber-400" />
              Upcoming Tasks
            </h3>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{task.title}</h4>
                      <p className="text-sm text-slate-400">{task.subject}</p>
                    </div>
                    <span className={`badge ${
                      task.type === 'quiz' ? 'badge-info' :
                      task.type === 'assignment' ? 'badge-warning' : 'badge-purple'
                    }`}>
                      {task.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                    <FiClock className="w-3 h-3" />
                    <span>Due in {task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <FiTarget className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.completedQuizzes || 8}</p>
                <p className="text-sm text-slate-400">Quizzes Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.completedAssignments || 12}</p>
                <p className="text-sm text-slate-400">Assignments Done</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <FiBookOpen className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.materialsViewed || 24}</p>
                <p className="text-sm text-slate-400">Materials Studied</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Classes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiBook className="w-5 h-5 text-emerald-400" />
              My Classes
            </h2>
            <span className="text-sm text-slate-400">{classes.length || 3} Enrolled Classes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(classes.length > 0 ? classes : [
              { _id: '1', classname: 'Software Engineering', teacher: { name: 'Rashid Mukhtar' }, semester: 'Fall 2024' },
              { _id: '2', classname: 'Database Systems', teacher: { name: 'Dr. Amjad Khan' }, semester: 'Fall 2024' },
              { _id: '3', classname: 'Web Engineering', teacher: { name: 'Prof. Farah Ahmed' }, semester: 'Fall 2024' },
            ]).map((cls, index) => (
              <div key={cls._id} className="group bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5">
                <div className={`h-28 bg-gradient-to-r ${gradients[index % gradients.length]} relative`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                      {cls.semester || 'Fall 2024'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1">
                      <FiCheckSquare className="w-3 h-3" /> Enrolled
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {cls.classname}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <FiUser className="w-4 h-4" />
                    <span>{cls.teacher?.name || 'Faculty TBA'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1,2,3].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                      <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">
                        +10
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                      Enter <FiArrowRight className="w-4 h-4" />
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
