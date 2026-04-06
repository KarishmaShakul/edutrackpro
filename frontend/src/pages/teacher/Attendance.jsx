import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiUsers, FiCalendar, FiSave, FiRefreshCw } from 'react-icons/fi'

export default function TeacherAttendance() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({}) // mapped by studentId: 'present'/'absent'/'late'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance()
      const interval = setInterval(() => fetchAttendance(false), 15000)
      return () => clearInterval(interval)
    } else {
      setStudents([])
      setAttendance({})
    }
  }, [selectedClass, date])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/teacher/classes')
      const data = response.data.data || response.data
      setClasses(data.classes || [])
      setErrorMsg('')
    } catch (error) {
      setErrorMsg('Failed to load classes')
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendance = async (showLoad = true) => {
    try {
      if (showLoad) setLoading(true)
      const res = await api.get(`/teacher/classes/${selectedClass}/attendance?date=${date}`)
      const data = res.data.data || res.data
      
      setStudents(data.students || [])
      
      const pastAttendance = {}
      if (data.attendance) {
        data.attendance.forEach(record => {
          pastAttendance[record.studentId] = record.status
        })
      }
      setAttendance(pastAttendance)
      setErrorMsg('')
    } catch (error) {
      if (showLoad) {
        setErrorMsg('Failed to load attendance for this class')
        toast.error('Failed to load attendance')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const records = students.map(student => ({
        studentId: student._id,
        status: attendance[student._id] || 'absent'
      }))

      await api.post(`/teacher/classes/${selectedClass}/attendance`, {
        date,
        records
      })
      
      toast.success('Attendance saved successfully')
      
      // refetch to sync average and DB values naturally
      fetchAttendance(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  if (loading && classes.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold text-white">Class Attendance</h1>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-center justify-between">
            <p>{errorMsg}</p>
            <button onClick={fetchClasses} className="px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition">
              Retry
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 bg-dark-100 p-6 rounded-xl border border-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">-- Choose a Class --</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.classname}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
              />
              <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {selectedClass && (
          <div className="bg-dark-100 rounded-xl border border-gray-800 overflow-hidden">
            {loading && students.length === 0 ? (
               <div className="flex items-center justify-center h-32">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
               </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No students enrolled in this class yet.</p>
              </div>
            ) : (
              <div>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <FiUsers className="text-emerald-500" /> Roster ({students.length})
                  </h3>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 px-6"
                  >
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    Save Attendance
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#1a1a24] text-left text-xs font-semibold text-gray-400 tracking-wider">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-xl">Student Name</th>
                        <th className="px-6 py-4 w-40 text-center">Present</th>
                        <th className="px-6 py-4 w-40 text-center">Absent</th>
                        <th className="px-6 py-4 w-40 text-center rounded-tr-xl">Late</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {students.map((student) => {
                        const status = attendance[student._id] || 'absent'
                        return (
                          <tr key={student._id} className="hover:bg-[#1a1a24]/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-200">{student.name}</div>
                              <div className="text-xs text-gray-500">{student.email}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <input 
                                type="radio" 
                                name={`att-${student._id}`}
                                className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                checked={status === 'present'}
                                onChange={() => handleStatusChange(student._id, 'present')}
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <input 
                                type="radio" 
                                name={`att-${student._id}`}
                                className="w-5 h-5 accent-red-500 cursor-pointer"
                                checked={status === 'absent'}
                                onChange={() => handleStatusChange(student._id, 'absent')}
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <input 
                                type="radio" 
                                name={`att-${student._id}`}
                                className="w-5 h-5 accent-amber-500 cursor-pointer"
                                checked={status === 'late'}
                                onChange={() => handleStatusChange(student._id, 'late')}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
