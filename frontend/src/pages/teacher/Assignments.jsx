import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    classId: '', title: '', description: '', dueDate: '', totalMarks: 100
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [classRes] = await Promise.all([api.get('/teacher/classes')])
      const classData = classRes.data.data || classRes.data
      setClasses(classData.classes || [])
      
      const allAssignments = []
      for (const cls of (classData.classes || [])) {
        try {
          const res = await api.get(`/teacher/classes/${cls._id}/assignments`)
          const assignData = res.data.data || res.data
          allAssignments.push(...(assignData.assignments || []))
        } catch (e) { /* continue */ }
      }
      setAssignments(allAssignments)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/teacher/assignments', formData)
      toast.success('Assignment created successfully')
      fetchData()
      setModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assignment')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.delete(`/teacher/assignments/${id}`)
      toast.success('Assignment deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'classId', label: 'Class', render: (row) => classes.find(c => c._id === row.classId)?.classname || 'Unknown' },
    { key: 'dueDate', label: 'Due Date', render: (row) => new Date(row.dueDate).toLocaleDateString() },
    { key: 'totalMarks', label: 'Marks' },
    { key: 'submissions', label: 'Submissions', render: (row) => row.submissions?.length || 0 },
    { key: 'actions', label: 'Actions', render: (row) => (
      <button onClick={() => handleDelete(row._id)} className="text-red-400 hover:text-red-300">
        <FiTrash2 className="w-5 h-5" />
      </button>
    )}
  ]

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Create Assignment
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={assignments} emptyMessage="No assignments created yet" />
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Assignment">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="input-dark"
                required
              >
                <option value="">Select Class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.classname}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-dark"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-dark"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Marks</label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                  className="input-dark"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Create</button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
