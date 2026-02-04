import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaUser, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.username, formData.password)
      navigate('/admin')
    } catch (err: any) {
      setError(err.message || '用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 }
  }

  return (
    <div className="login-page">
      <motion.div 
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="login-form"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.h2 
            className="login-title"
            variants={itemVariants}
          >
            用户登录
          </motion.h2>
          
          {error && (
            <motion.div 
              className="error-message"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <motion.div 
              className="form-group"
              variants={itemVariants}
            >
              <label htmlFor="username" className="form-label"><FaUser className="input-icon" />用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="请输入用户名"
              />
            </motion.div>
            
            <motion.div 
              className="form-group"
              variants={itemVariants}
            >
              <label htmlFor="password" className="form-label"><FaLock className="input-icon" />密码</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="请输入密码"
              />
            </motion.div>
            
            <motion.div 
              className="form-actions"
              variants={itemVariants}
            >
              <button 
                type="submit" 
                className="btn-primary btn-login"
                disabled={loading}
              >
                <FaSignInAlt />
                <span>{loading ? '登录中...' : '登录'}</span>
              </button>
              <button 
                type="button" 
                className="btn-secondary btn-register"
                onClick={() => navigate('/register')}
              >
                <FaUserPlus />
                <span>注册账号</span>
              </button>
            </motion.div>
          </form>
          
          <motion.div 
            className="login-footer"
            variants={itemVariants}
          >
            <p className="login-help">
              测试账号: admin<br />
              测试密码: admin123
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
