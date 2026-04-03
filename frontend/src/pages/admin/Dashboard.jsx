import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { FiUserCheck, FiBriefcase, FiBookOpen, FiCheckSquare, FiAlertTriangle, FiChevronRight, FiCalendar, FiUsers, FiBarChart2 } from 'react-icons/fi'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const DEPARTMENT_NAME = 'Department of Computer Science & Engineering'

const formatCurrentDate = () => {
  const d = new Date()
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/dashboard')
      setDashboard(response.data.data)
    } catch (e) {
      setError('Unable to load dashboard. Please check server connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    const onRefresh = () => fetchDashboard()
    window.addEventListener('admin-dashboard-refresh', onRefresh)
    return () => window.removeEventListener('admin-dashboard-refresh', onRefresh)
  }, [])

  const MetricCard = ({ title, value, icon: Icon, accentClass }) => (
    <div className="bg-[#12121a] rounded-xl p-5 border border-[#1e1e2e] hover:border-[#2a2a3a] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accentClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-[#12121a] rounded-xl border border-[#1e1e2e] overflow-hidden">
      <div className="p-5 border-b border-[#1e1e2e] flex items-center gap-2">
        <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
        <h2 className="text-base font-medium text-white truncate">{title}</h2>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )

  const Skeleton = () => (
    <Layout>
      <div className="space-y-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-48 bg-[#1a1a24] rounded" />
          <div className="h-8 w-64 bg-[#1a1a24] rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[#1a1a24] rounded-xl border border-[#1e1e2e]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[330px] bg-[#1a1a24] rounded-xl border border-[#1e1e2e]" />
          <div className="h-[330px] bg-[#1a1a24] rounded-xl border border-[#1e1e2e]" />
        </div>
        <div className="h-48 bg-[#1a1a24] rounded-xl border border-[#1e1e2e]" />
      </div>
    </Layout>
  )

  if (loading) return <Skeleton />

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-[#12121a] border border-[#1e1e2e] rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-white">Dashboard unavailable</h1>
              <p className="text-slate-500 text-sm mt-1">{error}</p>
              <button className="btn-primary mt-4" onClick={fetchDashboard}>Retry</button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const totals = dashboard?.totals || {}
  const userDistribution = dashboard?.userDistribution || {}
  const performance = Array.isArray(dashboard?.performance) ? dashboard.performance : []
  const alerts = dashboard?.alerts || {}

  const students = totals.students ?? 0
  const faculty = totals.faculty ?? 0
  const activeCourses = totals.activeCourses ?? 0
  const avgAttendance = totals.averageAttendance
  const avgAttendanceDisplay = avgAttendance === null || avgAttendance === undefined ? '—' : `${avgAttendance}%`

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Dashboard</span>
          <FiChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Admin</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Overview of Academic and System Performance</p>
            <p className="text-slate-400 text-sm mt-2 font-medium text-slate-300">
              {DEPARTMENT_NAME}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#12121a] text-sm text-slate-300">
              <FiCalendar className="w-4 h-4 text-indigo-400" />
              {formatCurrentDate()}
            </span>
          </div>
        </div>

        {/* Main Stat Cards – values from API only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Students"
            value={students}
            icon={FiUserCheck}
            accentClass="bg-emerald-500/10 text-emerald-400"
          />
          <MetricCard
            title="Total Faculty"
            value={faculty}
            icon={FiBriefcase}
            accentClass="bg-indigo-500/10 text-indigo-400"
          />
          <MetricCard
            title="Active Courses (This Semester)"
            value={activeCourses}
            icon={FiBookOpen}
            accentClass="bg-violet-500/10 text-violet-400"
          />
          <MetricCard
            title="Average Attendance %"
            value={avgAttendanceDisplay}
            icon={FiCheckSquare}
            accentClass="bg-slate-500/10 text-slate-300"
          />
        </div>

        {/* User Distribution – Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="User Distribution" icon={FiUsers}>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Students', value: userDistribution.students ?? 0 },
                      { name: 'Faculty', value: userDistribution.teachers ?? 0 },
                      { name: 'Admins', value: userDistribution.admins ?? 0 }
                    ]}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => (value > 0 ? `${name}: ${value}` : null)}
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#6366F1" />
                    <Cell fill="#EC4899" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a24',
                      border: '1px solid #2a2a3a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 16 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Subject Performance" icon={FiBarChart2}>
            {performance.length > 0 ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performance.slice(0, 8)}
                    margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="subjectName" stroke="#404050" fontSize={11} interval={0} angle={-25} textAnchor="end" height={70} />
                    <YAxis stroke="#404050" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a24',
                        border: '1px solid #2a2a3a',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 8 }} />
                    <Bar dataKey="averageMarks" name="Avg Marks %" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="passPercentage" name="Pass %" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[320px] flex items-center justify-center">
                <p className="text-sm text-slate-500">No performance data available.</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* System Alerts */}
        <SectionCard title="System Alerts" icon={FiAlertTriangle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <p className="text-sm font-medium text-white">Classes without Teacher</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{alerts.classesWithoutTeacher?.count ?? 0}</p>
              <div className="mt-3 space-y-1">
                {(alerts.classesWithoutTeacher?.items || []).slice(0, 3).map((i) => (
                  <p key={i.classname} className="text-xs text-slate-500 truncate">{i.classname} • {i.timeAgo}</p>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <p className="text-sm font-medium text-white">Assignments Past Due</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{alerts.assignmentsPastDue?.count ?? 0}</p>
              <div className="mt-3 space-y-1">
                {(alerts.assignmentsPastDue?.items || []).slice(0, 3).map((i) => (
                  <p key={`${i.title}-${i.dueDate}`} className="text-xs text-slate-500 truncate">{i.title} • {i.timeAgo}</p>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <p className="text-sm font-medium text-white">Low Attendance (&lt;75%)</p>
              <p className="text-2xl font-bold text-violet-400 mt-1">{alerts.lowAttendance?.count ?? 0}</p>
              <div className="mt-3 space-y-1">
                {(alerts.lowAttendance?.items || []).slice(0, 3).map((i) => (
                  <p key={i.classname} className="text-xs text-slate-500 truncate">{i.classname} • {i.attendanceAverage}%</p>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </Layout>
  )
}
