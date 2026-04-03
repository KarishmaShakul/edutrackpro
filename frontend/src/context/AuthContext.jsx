import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await api.get('/user/validate')
        // Backend wraps response in { success, message, data: { user } }
        setUser(response.data.data.user)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const response = await api.post('/user/login', { email, password })
    // Backend wraps response in { success, message, data: { token, refreshToken, user } }
    const { token, refreshToken, user } = response.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(user)
    return user
  }

  const logout = async () => {
    try {
      await api.post('/user/logout')
    } catch (error) {
      // Continue with local logout even if API fails
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const updateProfile = async (data) => {
    const response = await api.put('/user/profile', data)
    // Backend wraps response in { success, message, data: { user } }
    setUser(response.data.data.user)
    return response.data.data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
