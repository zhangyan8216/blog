import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { postApi } from '../services/api'
import { FaArrowLeft, FaSearch, FaTimes } from 'react-icons/fa'

interface Post {
  filename: string
  title: string
  content: string
  summary: string
  date: string | Date
  metadata: any
  tags?: string[]
}

const SearchResults: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    setQuery(searchQuery)
    fetchPosts()
  }, [searchQuery])

  useEffect(() => {
    if (posts.length > 0 && searchQuery) {
      filterPosts()
    } else {
      setFilteredPosts([])
    }
  }, [posts, searchQuery])

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

  const filterPosts = () => {
    if (!searchQuery) {
      setFilteredPosts([])
      return
    }

    const filtered = posts.filter(post => {
      const searchLower = searchQuery.toLowerCase()
      return (
        post.title?.toLowerCase().includes(searchLower) ||
        post.summary?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.metadata?.category?.toLowerCase().includes(searchLower)
      )
    })

    setFilteredPosts(filtered)
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    navigate('/search')
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">搜索中...</p>
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
    <div className="search-results">
      {/* 搜索头部 */}
      <motion.section 
        className="search-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <div className="search-header-content">
            <button 
              className="btn-back"
              onClick={handleBack}
            >
              <FaArrowLeft />
              <span>返回首页</span>
            </button>
            
            <form 
              className="search-form"
              onSubmit={handleSearch}
            >
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input"
                  autoFocus
                />
                {query && (
                  <button 
                    type="button" 
                    className="clear-button"
                    onClick={handleClearSearch}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <button type="submit" className="search-button">
                搜索
              </button>
            </form>
          </div>
          
          <h1 className="search-title">
            {searchQuery ? `搜索结果: "${searchQuery}"` : '搜索文章'}
          </h1>
        </div>
      </motion.section>

      {/* 搜索结果区域 */}
      <section className="search-results-section">
        <div className="container">
          {searchQuery ? (
            <>
              <motion.div 
                className="results-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p>找到 {filteredPosts.length} 篇相关文章</p>
              </motion.div>

              <AnimatePresence mode="wait">
                {filteredPosts.length > 0 ? (
                  <motion.div 
                    className="posts-grid"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0 }}
                  >
                    {filteredPosts.map((post, index) => (
                      <motion.article 
                        key={post.filename || index}
                        className="post-card"
                        variants={itemVariants}
                        whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/posts/${post.filename}`)}
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
                ) : (
                  <motion.div 
                    className="no-results"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="no-results-content">
                      <FaSearch className="no-results-icon" />
                      <h3>未找到相关文章</h3>
                      <p>尝试使用其他关键词搜索</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div 
              className="empty-search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="empty-search-content">
                <FaSearch className="empty-search-icon" />
                <h3>搜索文章</h3>
                <p>在上方输入关键词搜索文章</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default SearchResults
