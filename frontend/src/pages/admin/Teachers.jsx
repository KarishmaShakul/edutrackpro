import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiMail, FiCalendar, FiUser, FiBook, FiSearch } from 'react-icons/fi'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await api.get('/admin/teachers')
      const data = response.data?.data || response.data
      setTeachers(data?.teachers || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher._id}`, formData)
        toast.success('Teacher updated successfully')
      } else {
        await api.post('/admin/teachers', formData)
        toast.success('Teacher added successfully')
      }
      closeModal()
      await fetchTeachers(false)
      window.dispatchEvent(new CustomEvent('admin-dashboard-refresh'))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return
    try {
      await api.delete(`/admin/teachers/${id}`)
      toast.success('Teacher deleted successfully')
      await fetchTeachers(false)
      window.dispatchEvent(new CustomEvent('admin-dashboard-refresh'))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete teacher')
    }
  }

  const openModal = (teacher = null) => {
    setEditingTeacher(teacher)
    setFormData(teacher ? { name: teacher.name, email: teacher.email, password: '' } : { name: '', email: '', password: '' })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTeacher(null)
    setFormData({ name: '', email: '', password: '' })
  }

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { 
      key: 'name', 
      label: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
            {row.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'assignedClasses', 
      label: 'Classes',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiBook className="w-4 h-4 text-slate-500" />
          <span className="badge badge-info">{row.assignedClasses?.length || 0} Classes</span>
        </div>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Joined',
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-400">
          <FiCalendar className="w-4 h-4" />
          <span>{new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => openModal(row)} 
            className="w-9 h-9 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400 transition-all duration-200"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row._id)} 
            className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all duration-200"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Teachers</h1>
            <p className="text-slate-400 mt-1">Manage faculty members ({teachers.length} total)</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Add Teacher
          </button>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <FiUsers className="w-5 h-5 text-indigo-400" />
            <span className="text-slate-400">Total:</span>
            <span className="text-white font-semibold">{teachers.length}</span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading teachers...</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
            <DataTable 
              columns={columns} 
              data={filteredTeachers} 
              emptyMessage="No teachers found" 
            />
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'} icon={FiUser}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Enter teacher name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="example@edutrackpro.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {editingTeacher ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="••••••••"
                required={!editingTeacher}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">{editingTeacher ? 'Update Teacher' : 'Add Teacher'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
