import React from 'react'
import { motion } from 'framer-motion'
import { FaGithub, FaTwitter, FaInstagram, FaEnvelope, FaLink, FaHome, FaUser, FaCog } from 'react-icons/fa'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <motion.div 
        className="footer-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Memory-Blog</h3>
            <p className="footer-description">
              一个基于Flask和React的现代个人博客系统
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">快速链接</h4>
            <ul className="footer-links">
              <li><a href="/" className="footer-link"><FaHome className="footer-icon" />首页</a></li>
              <li><a href="/login" className="footer-link"><FaUser className="footer-icon" />登录</a></li>
              <li><a href="/register" className="footer-link"><FaLink className="footer-icon" />注册</a></li>
              <li><a href="/admin" className="footer-link"><FaCog className="footer-icon" />后台管理</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">联系我们</h4>
            <p className="footer-contact">
              <FaEnvelope className="contact-icon" /> admin@example.com<br />
              <FaGithub className="contact-icon" /> <a href="https://github.com/zhangyan8216/blog" className="footer-link" target="_blank" rel="noopener noreferrer">zhangyan8216/blog</a>
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Memory-Blog. All rights reserved.
          </p>
          <div className="footer-social">
            <a href="https://github.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub className="social-icon" />
            </a>
            <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter className="social-icon" />
            </a>
            <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="social-icon" />
            </a>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}

export default Footer
