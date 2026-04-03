import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiClock, FiCheckCircle } from 'react-icons/fi'

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const classRes = await api.get('/student/classes')
      const classData = classRes.data.data || classRes.data
      setClasses(classData.classes || [])
      
      const allQuizzes = []
      for (const cls of (classData.classes || [])) {
        try {
          const res = await api.get(`/student/classes/${cls._id}/quizzes`)
          const quizData = res.data.data || res.data
          allQuizzes.push(...(quizData.quizzes || []).map(q => ({ ...q, className: cls.classname })))
        } catch (e) { /* continue */ }
      }
      setQuizzes(allQuizzes)
    } catch (error) {
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return
    try {
      const submission = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        selectedAnswer: answer
      }))
      await api.post(`/student/quizzes/${selectedQuiz._id}/submit`, { answers: submission })
      toast.success('Quiz submitted successfully!')
      setSelectedQuiz(null)
      setAnswers({})
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz')
    }
  }

  const columns = [
    { key: 'title', label: 'Quiz Title' },
    { key: 'className', label: 'Class' },
    { key: 'questions', label: 'Questions', render: (row) => row.questions?.length || 0 },
    { key: 'timeLimit', label: 'Time', render: (row) => `${row.timeLimit} min` },
    { key: 'status', label: 'Status', render: (row) => (
      <span className={`badge ${row.hasSubmitted ? 'badge-success' : 'badge-warning'}`}>
        {row.hasSubmitted ? 'Completed' : 'Pending'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      row.hasSubmitted ? (
        <span className="text-green-400 flex items-center gap-1">
          <FiCheckCircle className="w-4 h-4" /> Done
        </span>
      ) : (
        <button
          onClick={() => setSelectedQuiz(row)}
          className="btn-primary text-sm py-1 px-3"
        >
          Take Quiz
        </button>
      )
    )}
  ]

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-6">My Quizzes</h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={quizzes} emptyMessage="No quizzes available" />
        )}

        {/* Quiz Modal */}
        <Modal isOpen={!!selectedQuiz} onClose={() => setSelectedQuiz(null)} title={selectedQuiz?.title} size="lg">
          {selectedQuiz && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-yellow-400 mb-4">
                <FiClock className="w-5 h-5" />
                <span>Time Limit: {selectedQuiz.timeLimit} minutes</span>
              </div>
              
              {selectedQuiz.questions?.map((q, index) => (
                <div key={q._id} className="bg-dark-200 rounded-lg p-4">
                  <p className="text-white font-medium mb-3">
                    {index + 1}. {q.question} <span className="text-gray-400 text-sm">({q.points} pts)</span>
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`q-${q._id}`}
                          value={opt}
                          checked={answers[q._id] === opt}
                          onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-gray-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setSelectedQuiz(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSubmitQuiz} className="btn-primary flex-1">Submit Quiz</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}
