import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiBook, FiUsers, FiUser, FiCalendar, FiSearch, FiBookOpen } from 'react-icons/fi'

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({ classname: '', description: '', teacher: '', semester: '', academicYear: '' })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [classRes, teacherRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/teachers')
      ])
      setClasses(classRes.data.data?.classes || [])
      setTeachers(teacherRes.data.data?.teachers || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingClass) {
        await api.put(`/admin/classes/${editingClass._id}`, formData)
        toast.success('Class updated successfully')
      } else {
        await api.post('/admin/classes', formData)
        toast.success('Class created successfully')
      }
      fetchData()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    try {
      await api.delete(`/admin/classes/${id}`)
      toast.success('Class deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete class')
    }
  }

  const openModal = (cls = null) => {
    setEditingClass(cls)
    setFormData(cls ? {
      classname: cls.classname,
      description: cls.description || '',
      teacher: cls.teacher?._id || '',
      semester: cls.semester || '',
      academicYear: cls.academicYear || ''
    } : { classname: '', description: '', teacher: '', semester: '', academicYear: '' })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingClass(null)
    setFormData({ classname: '', description: '', teacher: '', semester: '', academicYear: '' })
  }

  // Filter classes based on search
  const filteredClasses = classes.filter(c => 
    c.classname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Color gradients for class cards
  const gradients = [
    'from-indigo-600 to-purple-600',
    'from-emerald-600 to-teal-600',
    'from-blue-600 to-cyan-600',
    'from-orange-600 to-amber-600',
    'from-pink-600 to-rose-600',
  ]

  const columns = [
    { 
      key: 'classname', 
      label: 'Class',
      render: (row, index) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradients[index % gradients.length]} flex items-center justify-center text-white font-semibold`}>
            <FiBookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-white">{row.classname}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{row.description?.slice(0, 40) || 'No description'}...</p>
          </div>
        </div>
      )
    },
    { 
      key: 'teacher', 
      label: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUser className="w-4 h-4 text-slate-500" />
          <span className={row.teacher?.name ? 'text-slate-300' : 'text-slate-500 italic'}>
            {row.teacher?.name || 'Not Assigned'}
          </span>
        </div>
      )
    },
    { 
      key: 'students', 
      label: 'Students',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-slate-500" />
          <span className="badge badge-success">{row.students?.length || 0}</span>
        </div>
      )
    },
    { 
      key: 'semester', 
      label: 'Semester',
      render: (row) => (
        <span className="badge badge-info">{row.semester || 'N/A'}</span>
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
            <h1 className="text-2xl font-bold text-white">Classes</h1>
            <p className="text-slate-400 mt-1">Manage courses and class assignments ({classes.length} total)</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Create Class
          </button>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <FiBook className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400">Total:</span>
            <span className="text-white font-semibold">{classes.length}</span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading classes...</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
            <DataTable 
              columns={columns} 
              data={filteredClasses} 
              emptyMessage="No classes found" 
            />
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editingClass ? 'Edit Class' : 'Create New Class'} icon={FiBook}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Class Name</label>
              <div className="relative">
                <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={formData.classname}
                  onChange={(e) => setFormData({ ...formData, classname: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="e.g., Software Engineering"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                rows="3"
                placeholder="Brief description of the course..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Assign Teacher</label>
              <select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Semester</label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Fall 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">{editingClass ? 'Update Class' : 'Create Class'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
