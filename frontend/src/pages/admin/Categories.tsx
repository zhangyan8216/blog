import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi, Category } from '../../services/api'

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await adminApi.getCategories()
      setCategories(data.categories || [])
    } catch (err) {
      setError('加载分类失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      await adminApi.createCategory(newCategory.trim())
      setSuccess('分类创建成功')
      setNewCategory('')
      setShowAddForm(false)
      loadCategories()
    } catch (err) {
      setError('创建分类失败')
    }
  }

  const handleEditCategory = async (oldName: string) => {
    if (!editName.trim()) return

    try {
      await adminApi.updateCategory(oldName, editName.trim())
      setSuccess('分类更新成功')
      setEditingCategory(null)
      setEditName('')
      loadCategories()
    } catch (err) {
      setError('更新分类失败')
    }
  }

  const handleDeleteCategory = async (name: string) => {
    if (!window.confirm(`确定要删除分类"${name}"吗？`)) return

    try {
      await adminApi.deleteCategory(name)
      setSuccess('分类删除成功')
      loadCategories()
    } catch (err) {
      setError('删除分类失败')
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  }

  return (
    <motion.div 
      className="categories-content"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="content-header">
        <h2 className="section-title">分类管理</h2>
        <button 
          className="btn-add"
          onClick={() => setShowAddForm(true)}
        >
          添加分类
        </button>
      </div>

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

      {showAddForm && (
        <motion.div 
          className="add-form"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>添加新分类</h3>
          <form onSubmit={handleAddCategory}>
            <div className="form-group">
              <label htmlFor="categoryName">分类名称</label>
              <input
                type="text"
                id="categoryName"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="请输入分类名称"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">创建</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false)
                  setNewCategory('')
                }}
              >
                取消
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <p className="loading-text">加载中...</p>
      ) : categories.length === 0 ? (
        <p className="no-data">暂无分类</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>分类名称</th>
              <th>文章数量</th>
              <th>Slug</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.name}>
                <td>
                  {editingCategory === category.name ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td>{category.article_count}</td>
                <td>{category.slug}</td>
                <td className="actions-cell">
                  {editingCategory === category.name ? (
                    <>
                      <button 
                        className="btn-save"
                        onClick={() => handleEditCategory(category.name)}
                      >
                        保存
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => {
                          setEditingCategory(null)
                          setEditName('')
                        }}
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn-edit"
                        onClick={() => {
                          setEditingCategory(category.name)
                          setEditName(category.name)
                        }}
                      >
                        编辑
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteCategory(category.name)}
                        disabled={category.article_count > 0}
                      >
                        删除
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  )
}

export default Categories
