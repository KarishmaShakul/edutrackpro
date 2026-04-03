import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiBook, FiUser, FiFileText, FiCheckSquare } from 'react-icons/fi'

export default function StudentClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await api.get('/student/classes')
      const data = response.data.data || response.data
      setClasses(data.classes || [])
    } catch (error) {
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold text-white mb-6">My Classes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length > 0 ? classes.map((cls) => (
            <div key={cls._id} className="bg-dark-100 rounded-xl border border-gray-800 overflow-hidden card-hover">
              <div className="h-40 bg-gradient-to-r from-green-500 to-emerald-500 relative">
                {cls.coverImage && (
                  <img src={cls.coverImage} alt={cls.classname} className="w-full h-full object-cover opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-100 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-semibold text-white">{cls.classname}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-sm mb-4">{cls.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <FiUser className="w-4 h-4" />
                  <span>Teacher: {cls.teacher?.name || 'TBA'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span className="badge badge-info">{cls.semester}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-12 bg-dark-100 rounded-xl border border-gray-800">
              <FiBook className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">You are not enrolled in any classes yet.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
