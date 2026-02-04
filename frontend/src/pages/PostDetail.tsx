import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { postApi } from '../services/api'
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTag, FaFolder, FaHome } from 'react-icons/fa'
import { marked } from 'marked'

interface Post {
  filename: string
  title: string
  content: string
  summary: string
  date: string | Date
  metadata: any
  tags?: string[]
  author_id?: string
  author_name?: string
}

interface TableOfContents {
  id: string
  text: string
  level: number
  children?: TableOfContents[]
}

const PostDetail: React.FC = () => {
  const { filename } = useParams<{ filename: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toc, setToc] = useState<TableOfContents[]>([])
  const [activeTocId, setActiveTocId] = useState('')
  const [bannerImage, setBannerImage] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 页面加载时滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // 生成随机背景图片
    generateRandomBanner()
    
    if (filename) {
      fetchPostDetails()
    }
  }, [filename])

  const generateRandomBanner = () => {
    // 原神和崩铁的图片提示词
    const genshinPrompts = [
      'Genshin Impact landscape with mountains and colorful sky, anime style, high quality',
      'Genshin Impact character in beautiful environment, soft lighting, anime style',
      'Genshin Impact scenery with water and cherry blossoms, atmospheric, anime style',
      'Genshin Impact world with floating islands, magical atmosphere, anime style'
    ]
    
    const honkaiPrompts = [
      'Honkai: Star Rail space station interior, futuristic, anime style, high quality',
      'Honkai: Star Rail character in space, cosmic background, anime style',
      'Honkai: Star Rail planet landscape, science fiction, anime style',
      'Honkai: Star Rail battle scene, dynamic, anime style'
    ]
    
    // 随机选择一个游戏的提示词
    const gamePrompts = Math.random() > 0.5 ? genshinPrompts : honkaiPrompts
    const randomPrompt = gamePrompts[Math.floor(Math.random() * gamePrompts.length)]
    
    // 生成图片URL
    const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(randomPrompt)}&image_size=landscape_16_9`
    setBannerImage(imageUrl)
  }

  useEffect(() => {
    if (contentRef.current) {
      const handleScroll = () => {
        updateActiveToc()
      }
      
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [toc])

  useEffect(() => {
    if (contentRef.current && post) {
      // 为代码块添加复制按钮
      const codeBlocks = contentRef.current.querySelectorAll('pre')
      codeBlocks.forEach((block, index) => {
        // 检查是否已经添加了复制按钮
        if (!block.querySelector('.copy-button')) {
          const button = document.createElement('button')
          button.className = 'copy-button'
          button.innerHTML = '📋'
          button.setAttribute('data-index', index.toString())
          
          // 添加复制功能
          button.addEventListener('click', async () => {
            const codeElement = block.querySelector('code')
            if (codeElement) {
              const code = codeElement.textContent
              try {
                await navigator.clipboard.writeText(code || '')
                // 显示复制成功的反馈
                button.innerHTML = '✅'
                button.classList.add('copied')
                setTimeout(() => {
                  button.innerHTML = '📋'
                  button.classList.remove('copied')
                }, 2000)
              } catch (err) {
                console.error('复制失败:', err)
              }
            }
          })
          
          block.style.position = 'relative'
          block.appendChild(button)
        }
      })
    }
  }, [post])

  const fetchPostDetails = async () => {
    try {
      setLoading(true)
      setError('')
      const postData = await postApi.getPost(filename!)
      if (postData) {
        setPost(postData)
        // 生成目录
        generateToc(postData.content)
      } else {
        setError('文章不存在')
      }
    } catch (err) {
      console.error('获取文章详情失败:', err)
      setError('获取文章详情失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const generateToc = (content: string) => {
    const toc: TableOfContents[] = []
    const headerRegex = /^(#{1,6})\s+(.*)$/gm
    let match
    
    while ((match = headerRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/\s+/g, '-')
      
      const tocItem: TableOfContents = {
        id,
        text,
        level
      }
      
      if (level === 1) {
        toc.push(tocItem)
      } else if (level === 2 && toc.length > 0) {
        const parent = toc[toc.length - 1]
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(tocItem)
      } else if (level === 3 && toc.length > 0) {
        const parent = toc[toc.length - 1]
        if (parent.children && parent.children.length > 0) {
          const grandparent = parent.children[parent.children.length - 1]
          if (!grandparent.children) {
            grandparent.children = []
          }
          grandparent.children.push(tocItem)
        }
      }
    }
    
    setToc(toc)
  }

  const updateActiveToc = () => {
    if (!contentRef.current) return
    
    const headers = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let currentActiveId = ''
    
    headers.forEach((header) => {
      const rect = header.getBoundingClientRect()
      if (rect.top <= 100) {
        currentActiveId = header.id || header.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
      }
    })
    
    if (currentActiveId !== activeTocId) {
      setActiveTocId(currentActiveId)
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveTocId(id)
    }
  }

  const handleBack = () => {
    navigate('/')
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
          onClick={handleBack}
        >
          <FaArrowLeft />
          <span>返回首页</span>
        </button>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="error-container">
        <p className="error-text">文章不存在</p>
        <button 
          className="btn-primary" 
          onClick={handleBack}
        >
          <FaArrowLeft />
          <span>返回首页</span>
        </button>
      </div>
    )
  }

  return (
    <div className="post-detail">
      {/* 顶部横幅图片 */}
      <div 
        className="post-banner"
        style={{ 
          background: bannerImage 
            ? `url('${bannerImage}') no-repeat center center` 
            : undefined,
          backgroundSize: 'cover'
        }}
      >
        <div className="banner-content">
          <motion.h1 
            className="banner-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {post.title}
          </motion.h1>
          <motion.div 
            className="banner-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="meta-item">
              <FaCalendarAlt />
              <span>
                {typeof post.date === 'string' ? post.date : post.date?.toISOString().split('T')[0]}
              </span>
            </span>
            {post.author_name && (
              <span className="meta-item">
                <FaUser />
                <span>{post.author_name}</span>
              </span>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container">
        {/* 面包屑导航 */}
        <div className="breadcrumb">
          <span className="breadcrumb-item">
            <FaHome />
            <span>首页</span>
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">
            {post.title}
          </span>
        </div>

        <div className="post-content-wrapper">
          {/* 侧边栏目录 */}
          <div className="post-sidebar">
            <div className="toc-container">
              <h3 className="toc-title">Contents</h3>
              <div className="toc-list">
                {toc.map((item) => (
                  <div key={item.id} className="toc-item">
                    <div 
                      className={`toc-link ${activeTocId === item.id ? 'active' : ''}`}
                      onClick={() => scrollToSection(item.id)}
                      style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                    >
                      {item.text}
                    </div>
                    {item.children && item.children.length > 0 && (
                      <div className="toc-children">
                        {item.children.map((child) => (
                          <div key={child.id} className="toc-item">
                            <div 
                              className={`toc-link ${activeTocId === child.id ? 'active' : ''}`}
                              onClick={() => scrollToSection(child.id)}
                              style={{ paddingLeft: `${(child.level - 1) * 16}px` }}
                            >
                              {child.text}
                            </div>
                            {child.children && child.children.length > 0 && (
                              <div className="toc-children">
                                {child.children.map((grandchild) => (
                                  <div key={grandchild.id} className="toc-item">
                                    <div 
                                      className={`toc-link ${activeTocId === grandchild.id ? 'active' : ''}`}
                                      onClick={() => scrollToSection(grandchild.id)}
                                      style={{ paddingLeft: `${(grandchild.level - 1) * 16}px` }}
                                    >
                                      {grandchild.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="post-main">
            <motion.div 
              className="post-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button 
                className="btn-back"
                onClick={handleBack}
              >
                <FaArrowLeft />
                <span>返回列表</span>
              </button>
              <div className="post-meta">
                <div className="meta-item">
                  <FaCalendarAlt />
                  <span>
                    {typeof post.date === 'string' ? post.date : post.date?.toISOString().split('T')[0]}
                  </span>
                </div>
                {post.author_name && (
                  <div className="meta-item">
                    <FaUser />
                    <span>{post.author_name}</span>
                  </div>
                )}
                {post.metadata?.category && (
                  <div className="meta-item">
                    <FaFolder />
                    <span>{post.metadata.category}</span>
                  </div>
                )}
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="post-tag">
                      <FaTag />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div 
              className="post-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div 
                className="content-body" 
                ref={contentRef}
                dangerouslySetInnerHTML={{ 
                  __html: (marked(post.content) as string).replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/g, (_match: string, level: string, attrs: string, text: string) => {
                    const id = text.toLowerCase().replace(/\s+/g, '-')
                    return `<h${level} id="${id}" ${attrs}>${text}</h${level}>`
                  })
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetail