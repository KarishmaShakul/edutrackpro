import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiUpload, FiCheckCircle, FiClock } from 'react-icons/fi'

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const classRes = await api.get('/student/classes')
      const classData = classRes.data.data || classRes.data
      
      const allAssignments = []
      for (const cls of (classData.classes || [])) {
        try {
          const res = await api.get(`/student/classes/${cls._id}/assignments`)
          const assignData = res.data.data || res.data
          allAssignments.push(...(assignData.assignments || []).map(a => ({ ...a, className: cls.classname })))
        } catch (e) { /* continue */ }
      }
      setAssignments(allAssignments)
    } catch (error) {
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (assignmentId) => {
    try {
      await api.post(`/student/assignments/${assignmentId}/submit`, { fileUrl: '/uploads/dummy.pdf' })
      toast.success('Assignment submitted successfully!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit')
    }
  }

  const getDueStatus = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return { text: 'Overdue', class: 'badge-danger' }
    if (days <= 2) return { text: `${days}d left`, class: 'badge-warning' }
    return { text: `${days}d left`, class: 'badge-info' }
  }

  const columns = [
    { key: 'title', label: 'Assignment' },
    { key: 'className', label: 'Class' },
    { key: 'dueDate', label: 'Due Date', render: (row) => {
      const status = getDueStatus(row.dueDate)
      return (
        <div>
          <span>{new Date(row.dueDate).toLocaleDateString()}</span>
          <span className={`badge ${status.class} ml-2`}>{status.text}</span>
        </div>
      )
    }},
    { key: 'totalMarks', label: 'Marks' },
    { key: 'status', label: 'Status', render: (row) => (
      <span className={`badge ${row.hasSubmitted ? 'badge-success' : 'badge-warning'}`}>
        {row.hasSubmitted ? 'Submitted' : 'Pending'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      row.hasSubmitted ? (
        <span className="text-green-400 flex items-center gap-1">
          <FiCheckCircle className="w-4 h-4" /> Submitted
        </span>
      ) : (
        <button
          onClick={() => handleSubmit(row._id)}
          className="btn-primary text-sm py-1 px-3 flex items-center gap-1"
        >
          <FiUpload className="w-4 h-4" /> Submit
        </button>
      )
    )}
  ]

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-6">My Assignments</h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={assignments} emptyMessage="No assignments available" />
        )}
      </div>
    </Layout>
  )
}
