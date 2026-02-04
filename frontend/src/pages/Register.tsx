import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaSignInAlt } from 'react-icons/fa'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

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
    setSuccess('')

    // 表单验证
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位')
      setLoading(false)
      return
    }

    try {
      await authApi.register(formData.username, formData.email, formData.password)
      setSuccess('注册成功，即将跳转到登录页面...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || '注册失败，请重试')
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
    <div className="register-page">
      <motion.div 
        className="register-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="register-form"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.h2 
            className="register-title"
            variants={itemVariants}
          >
            用户注册
          </motion.h2>
          
          {error && (
            <motion.div 
              className="error-message"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              className="success-message"
              variants={itemVariants}
            >
              {success}
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
              <label htmlFor="email" className="form-label"><FaEnvelope className="input-icon" />邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="请输入邮箱"
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
                placeholder="请输入密码（至少6位）"
              />
            </motion.div>
            
            <motion.div 
              className="form-group"
              variants={itemVariants}
            >
              <label htmlFor="confirmPassword" className="form-label"><FaLock className="input-icon" />确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="请再次输入密码"
              />
            </motion.div>
            
            <motion.div 
              className="form-actions"
              variants={itemVariants}
            >
              <button 
                type="submit" 
                className="btn-primary btn-register"
                disabled={loading}
              >
                <FaUserPlus />
                <span>{loading ? '注册中...' : '注册'}</span>
              </button>
              <button 
                type="button" 
                className="btn-secondary btn-login"
                onClick={() => navigate('/login')}
              >
                <FaSignInAlt />
                <span>已有账号，去登录</span>
              </button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register
