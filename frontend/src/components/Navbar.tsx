import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaSignInAlt,
  FaUserPlus,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaBlog
} from 'react-icons/fa'

const MotionLink = motion(Link)

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  // 从 localStorage 读取主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      setTheme(initialTheme)
      document.documentElement.setAttribute('data-theme', initialTheme)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    // 添加过渡类名
    document.documentElement.classList.add('theme-transition')
    // 更新主题
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    // 移除过渡类名，以便下次切换时再次生效
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 300)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const menuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: 'auto' }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <motion.div 
          className="navbar-brand"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="brand-link">
            <FaBlog className="brand-icon" />
            <span className="brand-logo">Memory-Blog</span>
          </Link>
        </motion.div>

        <div className="navbar-links">
          <MotionLink 
            to="/" 
            className="nav-link"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome className="nav-icon" />
            <span>首页</span>
          </MotionLink>
          {isAuthenticated ? (
            <>
              <motion.button
                className="nav-link btn-user"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaUser className="nav-icon" />
                <span>{user?.username}</span>
              </motion.button>
              <motion.button
                className="nav-link btn-logout"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
              >
                <FaSignOutAlt className="nav-icon" />
                <span>登出</span>
              </motion.button>
              <motion.button
                className="nav-link btn-admin"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin')}
              >
                <FaCog className="nav-icon" />
                <span>后台管理</span>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                className="nav-link btn-login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
              >
                <FaSignInAlt className="nav-icon" />
                <span>登录</span>
              </motion.button>
              <motion.button
                className="nav-link btn-register"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
              >
                <FaUserPlus className="nav-icon" />
                <span>注册</span>
              </motion.button>
            </>
          )}
          <motion.button
            className="theme-toggle"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={toggleTheme}
          >
            <motion.div
              key={theme}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </motion.div>
          </motion.button>
        </div>

        <div className="navbar-toggle">
          <button 
            className="menu-button"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <motion.div 
        className="navbar-menu"
        variants={menuVariants}
        initial="closed"
        animate={isMenuOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
      >
        <div className="menu-links">
          <Link to="/" className="menu-link" onClick={() => setIsMenuOpen(false)}>
            <FaHome className="menu-icon" />
            <span>首页</span>
          </Link>
          {isAuthenticated ? (
            <>
              <button className="menu-link" onClick={() => setIsMenuOpen(false)}>
                <FaUser className="menu-icon" />
                <span>{user?.username}</span>
              </button>
              <button 
                className="menu-link"
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
              >
                <FaSignOutAlt className="menu-icon" />
                <span>登出</span>
              </button>
              <Link to="/admin" className="menu-link" onClick={() => setIsMenuOpen(false)}>
                <FaCog className="menu-icon" />
                <span>后台管理</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="menu-link" onClick={() => setIsMenuOpen(false)}>
                <FaSignInAlt className="menu-icon" />
                <span>登录</span>
              </Link>
              <Link to="/register" className="menu-link" onClick={() => setIsMenuOpen(false)}>
                <FaUserPlus className="menu-icon" />
                <span>注册</span>
              </Link>
            </>
          )}
          <motion.button 
            className="menu-link theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              key={theme}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'light' ? <><FaMoon className="menu-icon" /><span>暗色模式</span></> : <><FaSun className="menu-icon" /><span>亮色模式</span></>}
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </nav>
  )
}

export default Navbar
