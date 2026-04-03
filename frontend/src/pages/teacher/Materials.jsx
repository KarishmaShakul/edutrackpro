import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiDownload } from 'react-icons/fi'

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ classId: '', title: '', description: '', type: 'notes', weekNumber: 1 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const classRes = await api.get('/teacher/classes')
      const classData = classRes.data.data || classRes.data
      setClasses(classData.classes || [])
      
      const allMaterials = []
      for (const cls of (classData.classes || [])) {
        try {
          const res = await api.get(`/student/classes/${cls._id}/materials`)
          const matData = res.data.data || res.data
          allMaterials.push(...(matData.materials || []).map(m => ({ ...m, className: cls.classname })))
        } catch (e) { /* continue */ }
      }
      setMaterials(allMaterials)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/teacher/materials', formData)
      toast.success('Material uploaded successfully')
      fetchData()
      setModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.delete(`/teacher/materials/${id}`)
      toast.success('Material deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'className', label: 'Class' },
    { key: 'type', label: 'Type', render: (row) => <span className="badge badge-info">{row.type}</span> },
    { key: 'weekNumber', label: 'Week' },
    { key: 'downloads', label: 'Downloads' },
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
          <h1 className="text-2xl font-bold text-white">Materials</h1>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Upload Material
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={materials} emptyMessage="No materials uploaded yet" />
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Material">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-dark"
                >
                  <option value="notes">Notes</option>
                  <option value="lecture">Lecture</option>
                  <option value="slides">Slides</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Week Number</label>
                <input
                  type="number"
                  value={formData.weekNumber}
                  onChange={(e) => setFormData({ ...formData, weekNumber: Number(e.target.value) })}
                  className="input-dark"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Upload</button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
