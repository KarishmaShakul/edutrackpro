import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import DataTable from '../../components/DataTable'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiUsers, FiBook, FiTrendingUp, FiUserCheck, FiCalendar, FiBarChart2, FiAward, FiAlertCircle } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function HeadDashboard() {
  const [stats, setStats] = useState(null)
  const [classPerformance, setClassPerformance] = useState([])
  const [topStudents, setTopStudents] = useState([])
  const [bottomStudents, setBottomStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchDashboard(true)
    const interval = setInterval(() => fetchDashboard(false), 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboard = async (showLoad = true) => {
    try {
      if (showLoad) setLoading(true)
      setError(false)
      const response = await api.get('/head/dashboard')
      const data = response.data.data || response.data
      setStats(data.statistics || data.stats)
      setClassPerformance(data.classPerformance || [])
      setTopStudents(data.topStudents || [])
      setBottomStudents(data.bottomStudents || [])
    } catch (err) {
      setError(true)
      if (showLoad) toast.error('Failed to load dashboard')
    } finally {
      if (showLoad) setLoading(false)
    }
  }

  const tableColumns = [
    { key: 'name', label: 'Student Name', render: (row) => <span className="text-white font-medium">{row.name}</span> },
    { key: 'className', label: 'Class', render: (row) => row.className },
    { 
      key: 'score', 
      label: 'Score', 
      render: (row) => {
        const color = row.score >= 80 ? 'text-green-400' : row.score >= 60 ? 'text-yellow-400' : 'text-red-400'
        return <span className={`font-semibold ${color}`}>{row.score}%</span>
      } 
    },
    { 
      key: 'grade', 
      label: 'Grade', 
      render: (row) => {
        const color = row.grade?.startsWith('A') ? 'badge-success' : 
                      row.grade?.startsWith('B') ? 'badge-info' :
                      row.grade?.startsWith('C') ? 'badge-warning' : 'badge-danger'
        return <span className={`badge ${color}`}>{row.grade}</span>
      }
    }
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

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h2>
          <p className="text-slate-400 mb-6">There was a problem communicating with the server.</p>
          <button onClick={() => fetchDashboard(true)} className="btn-primary">
            Retry Connection
          </button>
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
            value={stats?.totalTeachers || 0} 
            icon={FiUsers} 
            color="indigo"
          />
          <StatCard 
            title="Total Students" 
            value={stats?.totalStudents || 0} 
            icon={FiUserCheck} 
            color="green"
          />
          <StatCard 
            title="Active Classes" 
            value={stats?.totalClasses || 0} 
            icon={FiBook} 
            color="purple"
          />
          <StatCard 
            title="Avg Performance" 
            value={`${stats?.avgPerformance || 0}%`} 
            icon={FiTrendingUp} 
            color="orange"
            subtitle="Department-wide"
          />
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Performance Chart */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-indigo-400" />
              Class Performance
            </h2>
            <div className="flex-1 min-h-[300px]">
              {classPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="className" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" domain={[0, 100]} />
                    <Tooltip 
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="avgScore" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <p>No class performance data available yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary Table (Top & Bottom 5) */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-6 overflow-hidden">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiAward className="w-5 h-5 text-amber-400" />
              Student Performance Rankings
            </h2>
            
            <div className="space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-sm text-emerald-400 font-medium mb-2 uppercase tracking-wide">Top 5 Students</h3>
                <DataTable 
                  columns={tableColumns} 
                  data={topStudents}
                  emptyMessage="No data available" 
                />
              </div>

              <div>
                <h3 className="text-sm text-red-400 font-medium mb-2 uppercase tracking-wide">Needs Improvement (Bottom 5)</h3>
                <DataTable 
                  columns={tableColumns} 
                  data={bottomStudents}
                  emptyMessage="No data available" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
