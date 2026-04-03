import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function StudentResults() {
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await api.get('/student/results')
      const data = response.data.data || response.data
      setResults(data.marks || [])
      setSummary(data.summary)
    } catch (error) {
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const gradeColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280']

  const columns = [
    { key: 'classId', label: 'Class', render: (row) => row.classId?.classname || 'Unknown' },
    { key: 'type', label: 'Type', render: (row) => <span className="badge badge-info">{row.type}</span> },
    { key: 'title', label: 'Title' },
    { key: 'marks', label: 'Score', render: (row) => `${row.marks}/${row.totalMarks}` },
    { key: 'percentage', label: '%', render: (row) => `${row.percentage?.toFixed(1)}%` },
    { key: 'grade', label: 'Grade', render: (row) => {
      const color = row.grade?.startsWith('A') ? 'badge-success' : 
                    row.grade?.startsWith('B') ? 'badge-info' :
                    row.grade?.startsWith('C') ? 'badge-warning' : 'badge-danger'
      return <span className={`badge ${color}`}>{row.grade}</span>
    }}
  ]

  // Prepare chart data
  const chartData = results.slice(0, 10).map(r => ({
    name: r.title?.slice(0, 15),
    score: r.percentage || 0
  }))

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
        <h1 className="text-2xl font-bold text-white mb-6">My Results</h1>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">Total Assessments</p>
              <p className="text-2xl font-bold text-white">{summary.totalAssessments || 0}</p>
            </div>
            <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-green-400">{summary.averagePercentage?.toFixed(1) || 0}%</p>
            </div>
            <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">Highest Score</p>
              <p className="text-2xl font-bold text-blue-400">{summary.highestScore?.toFixed(1) || 0}%</p>
            </div>
            <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">Overall Grade</p>
              <p className="text-2xl font-bold text-purple-400">{summary.overallGrade || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <div className="bg-dark-100 rounded-xl p-6 border border-gray-800 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Performance Overview</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E2E', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="score" fill="#0066FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Results Table */}
        <h2 className="text-lg font-semibold text-white mb-4">Detailed Results</h2>
        <DataTable columns={columns} data={results} emptyMessage="No results available" />
      </div>
    </Layout>
  )
}
