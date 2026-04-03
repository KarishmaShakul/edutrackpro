import { Link } from 'react-router-dom'
import { FiHome, FiAlertCircle } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full mb-8">
          <FiAlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <FiHome className="w-5 h-5" />
          Go Home
        </Link>
      </div>
    </div>
  )
}
