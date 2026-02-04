import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi, User } from '../../services/api'

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers()
      setUsers(data.users || [])
    } catch (err) {
      setError('加载用户失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      await adminApi.updateUserRole(userId, role)
      setSuccess('角色更新成功')
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      setError('更新角色失败')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('确定要删除该用户吗？')) return

    try {
      await adminApi.deleteUser(userId)
      setSuccess('用户删除成功')
      loadUsers()
    } catch (err) {
      setError('删除用户失败')
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  }

  return (
    <motion.div 
      className="users-content"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="content-header">
        <h2 className="section-title">用户管理</h2>
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

      <div className="users-container">
        {loading ? (
          <p className="loading-text">加载中...</p>
        ) : users.length === 0 ? (
          <p className="no-data">暂无用户</p>
        ) : (
          <table className="users-table data-table">
            <thead>
              <tr>
                <th>用户ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    {editingUser === user.id ? (
                      <select
                        className="role-select"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
                      >
                        <option value="user">普通用户</option>
                        <option value="admin">管理员</option>
                      </select>
                    ) : (
                      <div className="user-role">
                        <span className={`role-badge role-${user.role}`}>
                          {user.role === 'admin' ? '管理员' : '普通用户'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>{user.created_at || '-'}</td>
                  <td className="actions-cell">
                    {editingUser === user.id ? (
                      <>
                        <button 
                          className="btn-save"
                          onClick={() => handleUpdateRole(user.id, editRole)}
                        >
                          保存
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={() => {
                            setEditingUser(null)
                            setEditRole('user')
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
                            setEditingUser(user.id)
                            setEditRole(user.role)
                          }}
                        >
                          编辑角色
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user.id)}
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
      </div>
    </motion.div>
  )
}

export default Users
