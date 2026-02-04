import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { postApi } from '../services/api'
import {
  FaBookOpen,
  FaInfoCircle,
  FaArrowDown
} from 'react-icons/fa'

interface Post {
  filename: string
  title: string
  content: string
  summary: string
  date: string | Date
  metadata: any
  tags?: string[]
}

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(true)

  const handlePostClick = (filename: string) => {
    navigate(`/posts/${filename}`)
  }

  // 从API获取文章数据
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await postApi.getAllPosts()
        setPosts(data)
      } catch (err) {
        console.error('获取文章失败:', err)
        setError('获取文章失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // 滚动事件处理
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      // 当滚动超过100px时隐藏滚动按钮
      setShowScrollButton(scrollPosition < 100)
    }

    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll)

    // 清理事件监听器
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">{error}</p>
        <button 
          className="btn-primary" 
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="home">
      {/* 英雄区域 */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* 粒子装饰元素 */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Memory-Blog
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            记录生活，分享知识
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button 
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document.querySelector('.posts-section')?.scrollIntoView({
                  behavior: 'smooth'
                })
              }}
            >
              <FaBookOpen />
              <span>开始阅读</span>
            </motion.button>
            <motion.button 
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                alert('欢迎来到 Memory-Blog！\n\n这是一个现代化的博客系统，记录生活，分享知识。\n\n在这里你可以：\n- 阅读最新文章\n- 了解各种技术知识\n- 分享你的见解')
              }}
            >
              <FaInfoCircle />
              <span>了解更多</span>
            </motion.button>
          </motion.div>
          
          {/* 滚动按钮 - 使用AnimatePresence控制显示/隐藏 */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.div 
                className="hero-scroll"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.button
                  className="scroll-button"
                  whileHover={{ y: 5 }}
                  whileTap={{ y: 8 }}
                  onClick={() => {
                    document.querySelector('.posts-section')?.scrollIntoView({
                      behavior: 'smooth'
                    })
                  }}
                >
                  <FaArrowDown />
                  <span>向下滚动</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* 文章列表区域 */}
      <section className="posts-section">
        <div className="container">
          <h2 className="section-title">最新文章</h2>
          
          <motion.div 
            className="posts-grid"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {posts.map((post, index) => (
              <motion.article 
                key={post.filename || index}
                className="post-card"
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePostClick(post.filename)}
                style={{ cursor: 'pointer' }}
              >
                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.summary}</p>
                  <div className="post-meta">
                    <span className="post-date">
                      {typeof post.date === 'string' ? post.date : post.date?.toISOString().split('T')[0]}
                    </span>
                    {post.metadata?.category && (
                      <span className="post-category">{post.metadata.category}</span>
                    )}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="post-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 统计信息区域 */}
      <motion.section 
        className="stats-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <motion.div 
                className="stat-number"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {posts.length}
              </motion.div>
              <p className="stat-label">文章数量</p>
            </div>
            <div className="stat-card">
              <motion.div 
                className="stat-number"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {/* 计算分类数量 */}
                {Array.from(new Set(posts.map(post => post.metadata?.category).filter(Boolean))).length}
              </motion.div>
              <p className="stat-label">分类数量</p>
            </div>
            <div className="stat-card">
              <motion.div 
                className="stat-number"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {/* 计算标签数量 */}
                {Array.from(new Set(posts.flatMap(post => post.tags || []))).length}
              </motion.div>
              <p className="stat-label">标签数量</p>
            </div>
            <div className="stat-card">
              <motion.div 
                className="stat-number"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                1.2k
              </motion.div>
              <p className="stat-label">访问量</p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default Home
