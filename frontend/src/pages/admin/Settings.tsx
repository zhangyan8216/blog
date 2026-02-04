import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi, SiteSettings } from '../../services/api'

const defaultSettings: SiteSettings = {
  site_title: 'Memory Blog',
  site_description: '一个分享技术与生活的个人博客',
  site_keywords: '博客,技术,编程,生活',
  site_author: '博主',
  social_links: {
    github: '',
    twitter: '',
    weibo: '',
    zhihu: ''
  },
  seo: {
    baidu_verification: '',
    google_verification: '',
    ga_measurement_id: ''
  },
  features: {
    comments_enabled: true,
    rss_enabled: true,
    toc_enabled: true
  }
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await adminApi.getSettings()
      setSettings({ ...defaultSettings, ...data })
    } catch (err) {
      setError('加载设置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await adminApi.updateSettings(settings)
      setSuccess('设置保存成功')
    } catch (err) {
      setError('保存设置失败')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (path: string, value: any) => {
    const paths = path.split('.')
    setSettings(prev => {
      const newSettings = { ...prev }
      let current: any = newSettings
      
      for (let i = 0; i < paths.length - 1; i++) {
        if (current[paths[i]] === undefined) {
          current[paths[i]] = {}
        }
        current = current[paths[i]]
      }
      
      current[paths[paths.length - 1]] = value
      return newSettings
    })
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  }

  const tabs = [
    { id: 'basic', label: '基本信息' },
    { id: 'social', label: '社交链接' },
    { id: 'seo', label: 'SEO设置' },
    { id: 'features', label: '功能设置' }
  ]

  return (
    <motion.div 
      className="settings-content"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="content-header">
        <h2 className="section-title">网站设置</h2>
        <button 
          className="btn-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存设置'}
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

      {loading ? (
        <p className="loading-text">加载中...</p>
      ) : (
        <div className="settings-container">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="settings-form">
            {activeTab === 'basic' && (
              <div className="settings-section">
                <h3>基本信息</h3>
                <div className="form-group">
                  <label htmlFor="site_title">网站标题</label>
                  <input
                    type="text"
                    id="site_title"
                    value={settings.site_title}
                    onChange={(e) => handleChange('site_title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="site_description">网站描述</label>
                  <textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleChange('site_description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="site_keywords">网站关键词</label>
                  <input
                    type="text"
                    id="site_keywords"
                    value={settings.site_keywords}
                    onChange={(e) => handleChange('site_keywords', e.target.value)}
                    placeholder="用逗号分隔"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="site_author">网站作者</label>
                  <input
                    type="text"
                    id="site_author"
                    value={settings.site_author}
                    onChange={(e) => handleChange('site_author', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="settings-section">
                <h3>社交链接</h3>
                <div className="form-group">
                  <label htmlFor="github">GitHub</label>
                  <input
                    type="url"
                    id="github"
                    value={settings.social_links.github}
                    onChange={(e) => handleChange('social_links.github', e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="twitter">Twitter</label>
                  <input
                    type="url"
                    id="twitter"
                    value={settings.social_links.twitter}
                    onChange={(e) => handleChange('social_links.twitter', e.target.value)}
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weibo">微博</label>
                  <input
                    type="url"
                    id="weibo"
                    value={settings.social_links.weibo}
                    onChange={(e) => handleChange('social_links.weibo', e.target.value)}
                    placeholder="https://weibo.com/username"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zhihu">知乎</label>
                  <input
                    type="url"
                    id="zhihu"
                    value={settings.social_links.zhihu}
                    onChange={(e) => handleChange('social_links.zhihu', e.target.value)}
                    placeholder="https://zhihu.com/people/username"
                  />
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="settings-section">
                <h3>SEO设置</h3>
                <div className="form-group">
                  <label htmlFor="baidu_verification">百度站长验证</label>
                  <input
                    type="text"
                    id="baidu_verification"
                    value={settings.seo.baidu_verification}
                    onChange={(e) => handleChange('seo.baidu_verification', e.target.value)}
                    placeholder="百度站长工具提供的验证代码"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="google_verification">Google验证</label>
                  <input
                    type="text"
                    id="google_verification"
                    value={settings.seo.google_verification}
                    onChange={(e) => handleChange('seo.google_verification', e.target.value)}
                    placeholder="Google Search Console提供的验证代码"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ga_measurement_id">Google Analytics ID</label>
                  <input
                    type="text"
                    id="ga_measurement_id"
                    value={settings.seo.ga_measurement_id}
                    onChange={(e) => handleChange('seo.ga_measurement_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="settings-section">
                <h3>功能设置</h3>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.features.comments_enabled}
                      onChange={(e) => handleChange('features.comments_enabled', e.target.checked)}
                    />
                    启用评论系统
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.features.rss_enabled}
                      onChange={(e) => handleChange('features.rss_enabled', e.target.checked)}
                    />
                    启用RSS订阅
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.features.toc_enabled}
                      onChange={(e) => handleChange('features.toc_enabled', e.target.checked)}
                    />
                    启用文章目录
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Settings
