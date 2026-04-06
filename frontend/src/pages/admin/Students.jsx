import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck, FiMail, FiCalendar, FiUser, FiBook, FiSearch, FiEye, FiEyeOff, FiLock } from 'react-icons/fi'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchStudents(true)
    const interval = setInterval(() => fetchStudents(false), 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStudents = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await api.get('/admin/students')
      const data = response.data?.data || response.data
      setStudents(data?.students || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent._id}`, formData)
        toast.success('Student updated successfully')
      } else {
        await api.post('/admin/students', formData)
        toast.success('Student added successfully')
      }
      closeModal()
      await fetchStudents(false)
      window.dispatchEvent(new CustomEvent('admin-dashboard-refresh'))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await api.delete(`/admin/students/${id}`)
      toast.success('Student deleted successfully')
      await fetchStudents(false)
      window.dispatchEvent(new CustomEvent('admin-dashboard-refresh'))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student')
    }
  }

  const openModal = (student = null) => {
    setEditingStudent(student)
    setFormData(student ? { name: student.name, email: student.email, password: '' } : { name: '', email: '', password: '' })
    setShowPassword(false)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingStudent(null)
    setFormData({ name: '', email: '', password: '' })
    setShowPassword(false)
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-semibold">
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
      label: 'Enrolled',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiBook className="w-4 h-4 text-slate-500" />
          <span className="badge badge-success">{row.assignedClasses?.length || 0} Classes</span>
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
            <h1 className="text-2xl font-bold text-white">Students</h1>
            <p className="text-slate-400 mt-1">Manage enrolled students ({students.length} total)</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Add Student
          </button>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <FiUserCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-400">Total:</span>
            <span className="text-white font-semibold">{students.length}</span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading students...</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredStudents}
              emptyMessage="No students found"
            />
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editingStudent ? 'Edit Student' : 'Add New Student'} icon={FiUser}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="Enter student name"
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
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="example@edutrackpro.com"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {editingStudent ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required={!editingStudent}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}