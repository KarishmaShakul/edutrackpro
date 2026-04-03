import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiSearch, FiDownload, FiFilter, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

export default function HeadResults() {
  const [results, setResults] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState(null)

  // Export results to CSV
  const exportToCSV = () => {
    if (filteredResults.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = ['Student Name', 'Student Email', 'Class', 'Assessment Type', 'Title', 'Marks', 'Total', 'Percentage', 'Grade']
    
    const csvData = filteredResults.map(row => [
      row.student?.name || 'Unknown',
      row.student?.email || '',
      row.classId?.classname || 'Unknown',
      row.type || '',
      row.title || '',
      row.marks || 0,
      row.totalMarks || 0,
      row.percentage ? row.percentage.toFixed(1) : ((row.marks / row.totalMarks) * 100).toFixed(1),
      row.grade || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `results_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Results exported successfully!')
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchClassResults(selectedClass)
    }
  }, [selectedClass])

  const fetchData = async () => {
    try {
      const [classesRes, resultsRes] = await Promise.all([
        api.get('/head/classes'),
        api.get('/head/results')
      ])
      const classesData = classesRes.data.data || classesRes.data
      const resultsData = resultsRes.data.data || resultsRes.data
      setClasses(classesData.classes || [])
      setResults(resultsData.results || [])
      setStats(resultsData.stats)
    } catch (error) {
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const fetchClassResults = async (classId) => {
    try {
      const response = await api.get(`/head/classes/${classId}/results`)
      const data = response.data.data || response.data
      setResults(data.results || [])
      setStats(data.stats)
    } catch (error) {
      toast.error('Failed to load class results')
    }
  }

  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#6B7280']

  const gradeDistribution = [
    { name: 'A (90-100)', value: stats?.gradeA || 25, color: '#10B981' },
    { name: 'B (80-89)', value: stats?.gradeB || 35, color: '#6366F1' },
    { name: 'C (70-79)', value: stats?.gradeC || 25, color: '#F59E0B' },
    { name: 'D (60-69)', value: stats?.gradeD || 10, color: '#F97316' },
    { name: 'F (<60)', value: stats?.gradeF || 5, color: '#EF4444' }
  ]

  const filteredResults = results.filter(result =>
    result.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.classId?.classname?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { 
      key: 'student', 
      label: 'Student',
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.student?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-400">{row.student?.email}</p>
        </div>
      )
    },
    { 
      key: 'class', 
      label: 'Class',
      render: (row) => row.classId?.classname || 'Unknown'
    },
    { key: 'type', label: 'Type', render: (row) => <span className="badge badge-info">{row.type}</span> },
    { key: 'title', label: 'Assessment' },
    { 
      key: 'marks', 
      label: 'Score',
      render: (row) => `${row.marks}/${row.totalMarks}`
    },
    { 
      key: 'percentage', 
      label: 'Percentage',
      render: (row) => {
        const pct = row.percentage || ((row.marks / row.totalMarks) * 100)
        const color = pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'
        return <span className={`font-semibold ${color}`}>{pct.toFixed(1)}%</span>
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

  // Prepare trend data
  const trendData = [
    { month: 'Jan', avgScore: 72 },
    { month: 'Feb', avgScore: 75 },
    { month: 'Mar', avgScore: 78 },
    { month: 'Apr', avgScore: 74 },
    { month: 'May', avgScore: 80 },
    { month: 'Jun', avgScore: 82 }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Results Overview</h1>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-dark py-2"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.classname}</option>
              ))}
            </select>
            
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-dark pl-10 w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#12121a] rounded-xl p-4 border border-[#1e1e2e]">
            <p className="text-slate-500 text-sm">Total Records</p>
            <p className="text-2xl font-bold text-white">{results.length}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl p-4 border border-[#1e1e2e]">
            <p className="text-slate-500 text-sm">Average Score</p>
            <p className="text-2xl font-bold text-emerald-400">{stats?.avgScore?.toFixed(1) || 0}%</p>
          </div>
          <div className="bg-[#12121a] rounded-xl p-4 border border-[#1e1e2e]">
            <p className="text-slate-500 text-sm">Highest Score</p>
            <p className="text-2xl font-bold text-indigo-400">{stats?.highestScore || 0}%</p>
          </div>
          <div className="bg-[#12121a] rounded-xl p-4 border border-[#1e1e2e]">
            <p className="text-slate-500 text-sm">Lowest Score</p>
            <p className="text-2xl font-bold text-red-400">{stats?.lowestScore || 0}%</p>
          </div>
          <div className="bg-[#12121a] rounded-xl p-4 border border-[#1e1e2e]">
            <p className="text-slate-500 text-sm">Pass Rate</p>
            <p className="text-2xl font-bold text-violet-400">{stats?.passRate || 0}%</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Grade Distribution */}
          <div className="bg-[#12121a] rounded-xl p-5 border border-[#1e1e2e]">
            <h2 className="text-base font-medium text-white mb-4">Grade Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Trend */}
          <div className="bg-[#12121a] rounded-xl p-5 border border-[#1e1e2e]">
            <h2 className="text-base font-medium text-white mb-4">Performance Trend</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="month" stroke="#404050" />
                <YAxis stroke="#404050" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Comparison */}
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#1e1e2e] mb-8">
          <h2 className="text-base font-medium text-white mb-4">Class Comparison</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={classes.slice(0, 8).map(cls => ({
              name: cls.classname,
              avgScore: cls.avgScore || Math.floor(Math.random() * 30) + 60
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="name" stroke="#404050" fontSize={12} />
              <YAxis stroke="#404050" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px' }}
              />
              <Bar dataKey="avgScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Results Table */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Detailed Results</h2>
          <button 
            onClick={exportToCSV}
            className="btn-secondary py-2 px-4 flex items-center gap-2 hover:bg-indigo-600 hover:text-white"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        <DataTable 
          columns={columns} 
          data={filteredResults}
          emptyMessage="No results found"
        />
      </div>
    </Layout>
  )
}
