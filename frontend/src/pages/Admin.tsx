import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { postApi, adminApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Categories from './admin/Categories'
import Tags from './admin/Tags'
import Settings from './admin/Settings'
import Users from './admin/Users'

interface User {
  id: string
  username: string
  email?: string
  role: 'admin' | 'user'
  created_at?: string
}

interface Post {
  filename: string
  title: string
  date: string
  author_id?: string
  author_name?: string
  category?: string
  tags?: string[]
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setTimeout(() => {
      navigate('/login')
    }, 500)
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

  useEffect(() => {
    if (activeTab === 'posts' || activeTab === 'dashboard') {
      loadPosts()
    }
    if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await postApi.getAllPosts()
      setPosts(data)
    } catch (err) {
      console.error('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getUsers()
      setUsers(data.users || [])
    } catch (err) {
      console.error('加载用户失败')
    } finally {
      setLoading(false)
    }
  }



  const canEditPost = (post: Post) => {
    if (isAdmin) return true
    if (user && post.author_id === user.id) return true
    return false
  }

  return (
    <div className="admin-page">
      <motion.div 
        className="admin-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="admin-sidebar"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="sidebar-header">
            <h2 className="sidebar-title">后台管理</h2>
            {user && (
              <p className="sidebar-user">管理员: {user.username}</p>
            )}
          </div>
          <nav className="sidebar-nav">
            <ul className="nav-list">
              <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
                <button 
                  className="nav-link"
                  onClick={() => setActiveTab('dashboard')}
                >
                  仪表盘
                </button>
              </li>
              <li className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`}>
                <button 
                  className="nav-link"
                  onClick={() => setActiveTab('posts')}
                >
                  文章管理
                </button>
              </li>
              {isAdmin && (
                <>
                  <li className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}>
                    <button 
                      className="nav-link"
                      onClick={() => setActiveTab('categories')}
                    >
                      分类管理
                    </button>
                  </li>
                  <li className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`}>
                    <button 
                      className="nav-link"
                      onClick={() => setActiveTab('tags')}
                    >
                      标签管理
                    </button>
                  </li>
                  <li className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}>
                    <button 
                      className="nav-link"
                      onClick={() => setActiveTab('users')}
                    >
                      用户管理
                    </button>
                  </li>
                  <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
                    <button 
                      className="nav-link"
                      onClick={() => setActiveTab('settings')}
                    >
                      网站设置
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <div className="sidebar-footer">
            <button 
              className="btn-logout"
              onClick={handleLogout}
            >
              退出登录
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="admin-content"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="content-header"
            variants={itemVariants}
          >
            <h1 className="content-title">
              {activeTab === 'dashboard' && '仪表盘'}
              {activeTab === 'posts' && '文章管理'}
              {activeTab === 'categories' && '分类管理'}
              {activeTab === 'tags' && '标签管理'}
              {activeTab === 'users' && '用户管理'}
              {activeTab === 'settings' && '网站设置'}
            </h1>
          </motion.div>

          <motion.div 
            className="content-body"
            variants={itemVariants}
          >
            {activeTab === 'dashboard' && (
              <div className="dashboard-content">
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3 className="stat-title">文章总数</h3>
                    <p className="stat-number">{posts.length}</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="stat-title">分类总数</h3>
                    <p className="stat-number">{new Set(posts.map(p => p.category).filter(Boolean)).size}</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="stat-title">标签总数</h3>
                    <p className="stat-number">{new Set(posts.flatMap(p => p.tags || [])).size}</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="stat-title">用户总数</h3>
                    <p className="stat-number">{users.length || 1}</p>
                  </div>
                </div>
                <div className="recent-posts">
                  <h3 className="section-title">最近文章</h3>
                  {posts.length > 0 ? (
                    <table className="posts-table">
                      <thead>
                        <tr>
                          <th>标题</th>
                          <th>作者</th>
                          <th>发布时间</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.slice(0, 5).map((post) => (
                          <tr key={post.filename}>
                            <td>{post.title}</td>
                            <td>{post.author_name || '未知'}</td>
                            <td>{new Date(post.date).toLocaleDateString()}</td>
                            <td>
                              {canEditPost(post) && (
                                <>
                                  <button className="btn-edit" onClick={() => navigate(`/admin/posts/${post.filename}`)}>编辑</button>
                                  <button className="btn-delete">删除</button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-data">暂无文章</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="posts-content">
                <div className="actions-bar">
                  <button className="btn-add" onClick={() => navigate('/admin/posts/new')}>添加文章</button>
                </div>
                
                {loading ? (
                  <p className="loading-text">加载中...</p>
                ) : (
                  <table className="posts-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>标题</th>
                        <th>作者</th>
                        <th>发布时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.filename}>
                          <td>{post.filename}</td>
                          <td>{post.title}</td>
                          <td>{post.author_name || '未知'}</td>
                          <td>{new Date(post.date).toLocaleDateString()}</td>
                          <td>
                            {canEditPost(post) ? (
                              <>
                                <button className="btn-edit" onClick={() => navigate(`/admin/posts/${post.filename}`)}>编辑</button>
                                <button className="btn-delete">删除</button>
                              </>
                            ) : (
                              <span className="no-permission">无权限</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'categories' && isAdmin && <Categories />}

            {activeTab === 'tags' && isAdmin && <Tags />}

            {activeTab === 'users' && isAdmin && <Users />}

            {activeTab === 'settings' && isAdmin && <Settings />}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Admin