import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi, Tag } from '../../services/api'

const Tags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const data = await adminApi.getTags()
      setTags(data.tags || [])
    } catch (err) {
      setError('加载标签失败')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  }

  const getTagSize = (count: number) => {
    if (count >= 10) return 'large'
    if (count >= 5) return 'medium'
    return 'small'
  }

  return (
    <motion.div 
      className="tags-content"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="content-header">
        <h2 className="section-title">标签管理</h2>
      </div>

      {error && (
        <div className="error-message" onClick={() => setError('')}>
          {error}
        </div>
      )}

      {loading ? (
        <p className="loading-text">加载中...</p>
      ) : tags.length === 0 ? (
        <p className="no-data">暂无标签</p>
      ) : (
        <div className="tags-container">
          <div className="tags-overview">
            <h3>标签云</h3>
            <div className="tag-cloud">
              {tags.map((tag) => (
                <motion.span
                  key={tag.name}
                  className={`tag-item ${getTagSize(tag.article_count)} ${selectedTag?.name === tag.name ? 'selected' : ''}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag.name}
                  <span className="tag-count">{tag.article_count}</span>
                </motion.span>
              ))}
            </div>
          </div>

          {selectedTag && (
            <motion.div 
              className="tag-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3>标签详情: {selectedTag.name}</h3>
              <div className="tag-info">
                <p>使用次数: <strong>{selectedTag.article_count}</strong></p>
                <p>Slug: {selectedTag.slug}</p>
              </div>
              
              {selectedTag.articles && selectedTag.articles.length > 0 && (
                <div className="tag-articles">
                  <h4>使用该标签的文章</h4>
                  <ul>
                    {selectedTag.articles.map((article) => (
                      <li key={article.filename}>
                        <a href={`/post/${article.filename}`} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          <div className="tags-table-container">
            <h3>标签统计</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>标签名称</th>
                  <th>使用次数</th>
                  <th>Slug</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr 
                    key={tag.name}
                    className={selectedTag?.name === tag.name ? 'selected-row' : ''}
                    onClick={() => setSelectedTag(tag)}
                  >
                    <td>{tag.name}</td>
                    <td>
                      <span className={`badge badge-${getTagSize(tag.article_count)}`}>
                        {tag.article_count}
                      </span>
                    </td>
                    <td>{tag.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Tags
