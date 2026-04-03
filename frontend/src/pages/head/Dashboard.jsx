import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiUsers, FiBook, FiAward, FiTrendingUp, FiUserCheck, FiActivity, FiCalendar, FiTarget, FiBarChart2, FiCheckCircle } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

export default function HeadDashboard() {
  const [stats, setStats] = useState(null)
  const [classPerformance, setClassPerformance] = useState([])
  const [teacherStats, setTeacherStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/head/dashboard')
      const data = response.data.data || response.data
      setStats(data.statistics || data.stats)
      setClassPerformance(data.classPerformance || [])
      setTeacherStats(data.teacherStats || [])
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#6366f1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']

  // Default performance data
  const defaultClassPerformance = [
    { className: 'Software Eng.', avgScore: 82 },
    { className: 'Database Sys.', avgScore: 78 },
    { className: 'Web Eng.', avgScore: 85 },
    { className: 'Data Struct.', avgScore: 75 },
    { className: 'OOP', avgScore: 80 },
  ]

  // Monthly progress data
  const monthlyData = [
    { month: 'Jan', students: 45, quizzes: 12 },
    { month: 'Feb', students: 52, quizzes: 18 },
    { month: 'Mar', students: 48, quizzes: 24 },
    { month: 'Apr', students: 60, quizzes: 30 },
    { month: 'May', students: 55, quizzes: 28 },
    { month: 'Jun', students: 65, quizzes: 35 }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
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
            <h1 className="text-2xl font-bold text-white">Department Head Dashboard</h1>
            <p className="text-slate-400 mt-1">Monitor department performance and analytics</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-xl">
            <FiCalendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard 
            title="Total Teachers" 
            value={stats?.teacherCount || 5} 
            icon={FiUsers} 
            color="indigo"
            change={10}
            subtitle="Faculty members"
          />
          <StatCard 
            title="Total Students" 
            value={stats?.studentCount || 43} 
            icon={FiUserCheck} 
            color="green"
            change={15}
            subtitle="Enrolled in SE"
          />
          <StatCard 
            title="Active Classes" 
            value={stats?.classCount || 8} 
            icon={FiBook} 
            color="purple"
            change={5}
            subtitle="SE Courses"
          />
          <StatCard 
            title="Avg Performance" 
            value={`${stats?.avgPerformance || 78}%`} 
            icon={FiTrendingUp} 
            color="orange"
            change={8}
            subtitle="Department-wide"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Performance Chart */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-indigo-400" />
              Class Performance
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformance.length > 0 ? classPerformance : defaultClassPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="className" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="avgScore" fill="#6366f1" radius={[8, 8, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Progress Chart */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-emerald-400" />
              Monthly Progress
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#10b981" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={2} name="Active Students" />
                  <Area type="monotone" dataKey="quizzes" stroke="#6366f1" fillOpacity={1} fill="url(#colorQuizzes)" strokeWidth={2} name="Quizzes Taken" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-400">Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm text-slate-400">Quizzes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grade Distribution */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-amber-400" />
              Grade Distribution
            </h2>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'A Grade', value: 30 },
                      { name: 'B Grade', value: 40 },
                      { name: 'C Grade', value: 20 },
                      { name: 'D Grade', value: 8 },
                      { name: 'F Grade', value: 2 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {['A', 'B', 'C', 'D', 'F'].map((grade, idx) => (
                <span key={grade} className="flex items-center gap-1 text-xs bg-slate-800/50 px-2 py-1 rounded-lg">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                  <span className="text-slate-400">{grade}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Top Performing Classes */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiTarget className="w-5 h-5 text-emerald-400" />
              Top Classes
            </h2>
            <div className="space-y-3">
              {(classPerformance.length > 0 ? classPerformance.slice(0, 5) : [
                { className: 'Web Engineering', avgScore: 85 },
                { className: 'Software Engineering', avgScore: 82 },
                { className: 'OOP', avgScore: 80 },
                { className: 'Database Systems', avgScore: 78 },
                { className: 'Data Structures', avgScore: 75 }
              ]).map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                      idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                      idx === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-slate-700/50 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-white text-sm">{cls.className}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">{cls.avgScore}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-purple-400" />
              Quick Overview
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-slate-300">Total Quizzes</span>
                </div>
                <span className="text-white font-bold text-xl">{stats?.quizCount || 5}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <FiBook className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">Assignments</span>
                </div>
                <span className="text-white font-bold text-xl">{stats?.assignmentCount || 6}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FiAward className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-slate-300">Pass Rate</span>
                </div>
                <span className="text-emerald-400 font-bold text-xl">{stats?.passRate || 85}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
