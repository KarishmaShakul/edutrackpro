import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    classId: '', title: '', description: '', timeLimit: 30, questions: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [classRes] = await Promise.all([api.get('/teacher/classes')])
      const classData = classRes.data.data || classRes.data
      setClasses(classData.classes || [])
      
      // Fetch quizzes for all classes
      const allQuizzes = []
      for (const cls of (classData.classes || [])) {
        try {
          const quizRes = await api.get(`/teacher/classes/${cls._id}/quizzes`)
          const quizData = quizRes.data.data || quizRes.data
          allQuizzes.push(...(quizData.quizzes || []))
        } catch (e) { /* continue */ }
      }
      setQuizzes(allQuizzes)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/teacher/quizzes', formData)
      toast.success('Quiz created successfully')
      fetchData()
      setModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return
    try {
      await api.delete(`/teacher/quizzes/${id}`)
      toast.success('Quiz deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete quiz')
    }
  }

  const columns = [
    { key: 'title', label: 'Quiz Title' },
    { key: 'classId', label: 'Class', render: (row) => classes.find(c => c._id === row.classId)?.classname || 'Unknown' },
    { key: 'questions', label: 'Questions', render: (row) => row.questions?.length || 0 },
    { key: 'timeLimit', label: 'Time (min)' },
    { key: 'isPublished', label: 'Status', render: (row) => (
      <span className={`badge ${row.isPublished ? 'badge-success' : 'badge-warning'}`}>
        {row.isPublished ? 'Published' : 'Draft'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleDelete(row._id)} className="text-red-400 hover:text-red-300">
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    )}
  ]

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Quizzes</h1>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Create Quiz
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={quizzes} emptyMessage="No quizzes created yet" />
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Quiz" size="lg">
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
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Limit (minutes)</label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                className="input-dark"
                min="5"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Create Quiz</button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
