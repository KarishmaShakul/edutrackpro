import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function TeacherMarks() {
  const [marks, setMarks] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState('')
  const [formData, setFormData] = useState({
    studentId: '', classId: '', type: 'quiz', title: '', marks: 0, totalMarks: 100
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) fetchMarks()
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const res = await api.get('/teacher/classes')
      const data = res.data.data || res.data
      setClasses(data.classes || [])
      if ((data.classes || []).length > 0) {
        setSelectedClass(data.classes[0]._id)
      }
    } catch (error) {
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const fetchMarks = async () => {
    try {
      const res = await api.get(`/teacher/classes/${selectedClass}/marks`)
      const data = res.data.data || res.data
      setMarks(data.marks || [])
      
      const cls = classes.find(c => c._id === selectedClass)
      setStudents(cls?.students || [])
    } catch (error) {
      toast.error('Failed to load marks')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/teacher/marks', { ...formData, classId: selectedClass })
      toast.success('Marks added successfully')
      fetchMarks()
      setModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add marks')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.delete(`/teacher/marks/${id}`)
      toast.success('Marks deleted')
      fetchMarks()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const columns = [
    { key: 'studentId', label: 'Student', render: (row) => row.studentId?.name || 'Unknown' },
    { key: 'type', label: 'Type', render: (row) => <span className="badge badge-info">{row.type}</span> },
    { key: 'title', label: 'Title' },
    { key: 'marks', label: 'Marks', render: (row) => `${row.marks}/${row.totalMarks}` },
    { key: 'percentage', label: '%', render: (row) => `${row.percentage?.toFixed(1)}%` },
    { key: 'grade', label: 'Grade', render: (row) => <span className="badge badge-success">{row.grade}</span> },
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
          <h1 className="text-2xl font-bold text-white">Marks Management</h1>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Add Marks
          </button>
        </div>

        <div className="mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input-dark max-w-xs"
          >
            {classes.map((c) => <option key={c._id} value={c._id}>{c.classname}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={marks} emptyMessage="No marks recorded yet" />
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Marks">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Student</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="input-dark"
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-dark"
                >
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="project">Project</option>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Marks Obtained</label>
                <input
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                  className="input-dark"
                  min="0"
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
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Add Marks</button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
