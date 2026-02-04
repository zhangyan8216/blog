import React, { useState, useEffect } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import { postApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface PostFormData {
  title: string
  content: string
  tags: string
  category: string
  format: 'markdown' | 'html'
}

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    tags: '',
    category: '',
    format: 'markdown'
  })

  useEffect(() => {
    if (id) {
      loadPost()
    }
  }, [id])

  const loadPost = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const post = await postApi.getPost(id)
      if (post) {
        setFormData({
          title: post.title || '',
          content: post.content || '',
          tags: post.tags?.join(', ') || '',
          category: post.metadata?.category || '',
          format: 'markdown'
        })
      }
    } catch (err) {
      setError('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const tags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : []

      let result;
      if (id) {
        // 更新现有文章
        result = await postApi.updatePost(id, {
          title: formData.title,
          content: formData.content,
          tags,
          category: formData.category
        })
      } else {
        // 创建新文章
        result = await postApi.createPost({
          title: formData.title,
          content: formData.content,
          tags,
          category: formData.category
        })
      }

      if (result) {
        setSuccess('文章保存成功！')
        setTimeout(() => {
          navigate('/admin')
        }, 1500)
      } else {
        setError('文章保存失败，请重试')
      }
    } catch (err) {
      setError('保存文章时发生错误')
      console.error('保存文章失败:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin')
  }



  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">后台管理</h2>
            {user && (
              <p className="sidebar-user">管理员: {user.username}</p>
            )}
          </div>
          <nav className="sidebar-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <button 
                  className="nav-link"
                  onClick={() => navigate('/admin')}
                >
                  仪表盘
                </button>
              </li>
              <li className="nav-item active">
                <button 
                  className="nav-link"
                  onClick={() => navigate('/admin')}
                >
                  文章管理
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="admin-content">
          <div className="content-header">
            <h1 className="content-title">
              {id ? '编辑文章' : '添加文章'}
            </h1>
          </div>
          <div className="content-body">
            <div className="categories-content">
              {error && (
                <div className="error-message" onClick={() => setError('')}>
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message" onClick={() => setSuccess('')}>
                  {success}
                </div>
              )}

              {loading ? (
                <p className="loading-text">加载中...</p>
              ) : (
                <div className="add-form">
                  <h3>{id ? '编辑文章' : '添加新文章'}</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="title">标题</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="请输入文章标题"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="format">文章格式</label>
                      <select
                        id="format"
                        name="format"
                        value={formData.format}
                        onChange={handleInputChange}
                      >
                        <option value="markdown">Markdown</option>
                        <option value="html">HTML</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="content">内容</label>
                      <div className="editor-container">
                        <textarea
                          id="content"
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          rows={20}
                          required
                          placeholder={formData.format === 'markdown' ? '请输入Markdown格式的文章内容' : '请输入HTML格式的文章内容'}
                        />
                        <div className="editor-help">
                          {formData.format === 'markdown' && (
                            <div className="format-help">
                              <h4>Markdown 语法提示：</h4>
                              <ul>
                                <li><code># 标题</code> - 一级标题</li>
                                <li><code>## 标题</code> - 二级标题</li>
                                <li><code>**粗体**</code> - 粗体文本</li>
                                <li><code>*斜体*</code> - 斜体文本</li>
                                <li><code>```代码```</code> - 代码块</li>
                                <li><code>- 列表项</code> - 无序列表</li>
                                <li><code>![图片描述](链接)</code> - 插入图片</li>
                                <li><code>[链接文本](链接)</code> - 插入链接</li>
                              </ul>
                            </div>
                          )}
                          {formData.format === 'html' && (
                            <div className="format-help">
                              <h4>HTML 语法提示：</h4>
                              <ul>
                                <li><code>&lt;h1&gt;标题&lt;/h1&gt;</code> - 一级标题</li>
                                <li><code>&lt;p&gt;段落&lt;/p&gt;</code> - 段落</li>
                                <li><code>&lt;strong&gt;粗体&lt;/strong&gt;</code> - 粗体文本</li>
                                <li><code>&lt;em&gt;斜体&lt;/em&gt;</code> - 斜体文本</li>
                                <li><code>&lt;code&gt;代码&lt;/code&gt;</code> - 代码</li>
                                <li><code>&lt;img src="链接" alt="描述"&gt;</code> - 插入图片</li>
                                <li><code>&lt;a href="链接"&gt;链接文本&lt;/a&gt;</code> - 插入链接</li>
                                <li><code>&lt;ul&gt;&lt;li&gt;列表项&lt;/li&gt;&lt;/ul&gt;</code> - 无序列表</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="tags">标签（用逗号分隔）</label>
                        <input
                          type="text"
                          id="tags"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="例如：技术, 编程, 分享"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="category">分类</label>
                        <input
                          type="text"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          placeholder="例如：技术分享"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        返回
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={saving}
                      >
                        {saving ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPost
