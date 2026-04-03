import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiBook, FiUsers, FiUser, FiEye, FiSearch, FiFilter } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function HeadClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [classDetails, setClassDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await api.get('/head/classes')
      const data = response.data.data || response.data
      setClasses(data.classes || [])
    } catch (error) {
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const fetchClassDetails = async (classId) => {
    setLoadingDetails(true)
    try {
      const response = await api.get(`/head/classes/${classId}/results`)
      const data = response.data.data || response.data
      setClassDetails(data)
    } catch (error) {
      toast.error('Failed to load class details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleViewDetails = (cls) => {
    setSelectedClass(cls)
    setShowDetailsModal(true)
    fetchClassDetails(cls._id)
  }

  const filteredClasses = classes.filter(cls =>
    cls.classname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { 
      key: 'classname', 
      label: 'Class Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
            <FiBook className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-white">{row.classname}</span>
        </div>
      )
    },
    { 
      key: 'teacher', 
      label: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUser className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{row.teacher?.name || 'Not Assigned'}</span>
        </div>
      )
    },
    { 
      key: 'students', 
      label: 'Students',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{row.students?.length || 0}</span>
        </div>
      )
    },
    { 
      key: 'quizCount', 
      label: 'Quizzes',
      render: (row) => (
        <span className="badge badge-info">{row.quizCount || 0}</span>
      )
    },
    { 
      key: 'avgScore', 
      label: 'Avg Score',
      render: (row) => {
        const score = row.avgScore || 0
        const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
        return <span className={`font-semibold ${color}`}>{score.toFixed(1)}%</span>
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="btn-secondary py-2 px-3 text-sm flex items-center gap-2"
        >
          <FiEye className="w-4 h-4" />
          View Details
        </button>
      )
    }
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
          <h1 className="text-2xl font-bold text-white">All Classes</h1>
          
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Classes</p>
            <p className="text-2xl font-bold text-white">{classes.length}</p>
          </div>
          <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-2xl font-bold text-blue-400">
              {classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Teachers</p>
            <p className="text-2xl font-bold text-green-400">
              {new Set(classes.map(cls => cls.teacher?._id).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Class Size</p>
            <p className="text-2xl font-bold text-purple-400">
              {classes.length > 0 
                ? Math.round(classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0) / classes.length)
                : 0}
            </p>
          </div>
        </div>

        {/* Classes Table */}
        <DataTable 
          columns={columns} 
          data={filteredClasses}
          emptyMessage="No classes found"
        />

        {/* Class Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedClass(null)
            setClassDetails(null)
          }}
          title={`Class Details: ${selectedClass?.classname || ''}`}
          size="lg"
        >
          {loadingDetails ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Class Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-200 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Teacher</p>
                  <p className="text-white font-medium">{selectedClass?.teacher?.name || 'Not Assigned'}</p>
                </div>
                <div className="bg-dark-200 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Students</p>
                  <p className="text-white font-medium">{selectedClass?.students?.length || 0}</p>
                </div>
              </div>

              {/* Performance Chart */}
              {classDetails?.studentPerformance?.length > 0 && (
                <div className="bg-dark-200 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4">Student Performance</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={classDetails.studentPerformance.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} />
                      <YAxis stroke="#666" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E1E2E', border: '1px solid #333' }}
                      />
                      <Bar dataKey="avgScore" fill="#0066FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{classDetails?.stats?.avgScore?.toFixed(1) || 0}%</p>
                  <p className="text-gray-400 text-sm">Average Score</p>
                </div>
                <div className="bg-dark-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{classDetails?.stats?.highestScore || 0}%</p>
                  <p className="text-gray-400 text-sm">Highest Score</p>
                </div>
                <div className="bg-dark-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{classDetails?.stats?.passRate || 0}%</p>
                  <p className="text-gray-400 text-sm">Pass Rate</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}
