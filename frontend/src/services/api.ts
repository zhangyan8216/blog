import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface Category {
  name: string;
  slug: string;
  article_count: number;
  created_at?: string;
}

export interface Tag {
  name: string;
  slug: string;
  article_count: number;
  articles?: { filename: string; title: string }[];
}

export interface SiteSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  site_author: string;
  social_links: {
    github: string;
    twitter: string;
    weibo: string;
    zhihu: string;
  };
  seo: {
    baidu_verification: string;
    google_verification: string;
    ga_measurement_id: string;
  };
  features: {
    comments_enabled: boolean;
    rss_enabled: boolean;
    toc_enabled: boolean;
  };
  theme?: {
    primary_color: string;
    background_color: string;
    text_color: string;
  };
}

export const authApi = {
  login: async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error: any) {
      console.error('登录失败:', error);
      throw error.response?.data?.error || '登录失败，请重试';
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      throw error.response?.data?.error || '获取用户信息失败';
    }
  },

  checkAuth: async () => {
    try {
      const response = await apiClient.get('/auth/check');
      return response.data;
    } catch (error: any) {
      console.error('检查认证状态失败:', error);
      return { isAuthenticated: false };
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password
      });
      return response.data;
    } catch (error: any) {
      console.error('注册失败:', error);
      throw error.response?.data?.error || '注册失败，请重试';
    }
  }
};

export const adminApi = {
  getUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      throw error.response?.data?.error || '获取用户列表失败';
    }
  },

  updateUserRole: async (userId: string, role: 'admin' | 'user') => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error: any) {
      console.error('修改用户角色失败:', error);
      throw error.response?.data?.error || '修改用户角色失败';
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('删除用户失败:', error);
      throw error.response?.data?.error || '删除用户失败';
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/admin/categories');
      return response.data;
    } catch (error: any) {
      console.error('获取分类列表失败:', error);
      throw error.response?.data?.error || '获取分类列表失败';
    }
  },

  createCategory: async (name: string) => {
    try {
      const response = await apiClient.post('/admin/categories', { name });
      return response.data;
    } catch (error: any) {
      console.error('创建分类失败:', error);
      throw error.response?.data?.error || '创建分类失败';
    }
  },

  updateCategory: async (categoryName: string, name: string) => {
    try {
      const response = await apiClient.put(`/admin/categories/${encodeURIComponent(categoryName)}`, { name });
      return response.data;
    } catch (error: any) {
      console.error('更新分类失败:', error);
      throw error.response?.data?.error || '更新分类失败';
    }
  },

  deleteCategory: async (categoryName: string) => {
    try {
      const response = await apiClient.delete(`/admin/categories/${encodeURIComponent(categoryName)}`);
      return response.data;
    } catch (error: any) {
      console.error('删除分类失败:', error);
      throw error.response?.data?.error || '删除分类失败';
    }
  },

  getTags: async () => {
    try {
      const response = await apiClient.get('/admin/tags');
      return response.data;
    } catch (error: any) {
      console.error('获取标签列表失败:', error);
      throw error.response?.data?.error || '获取标签列表失败';
    }
  },

  getSettings: async (): Promise<SiteSettings> => {
    try {
      const response = await apiClient.get('/admin/settings');
      return response.data;
    } catch (error: any) {
      console.error('获取网站设置失败:', error);
      throw error.response?.data?.error || '获取网站设置失败';
    }
  },

  updateSettings: async (settings: Partial<SiteSettings>) => {
    try {
      const response = await apiClient.put('/admin/settings', settings);
      return response.data;
    } catch (error: any) {
      console.error('更新网站设置失败:', error);
      throw error.response?.data?.error || '更新网站设置失败';
    }
  }
};

export const postApi = {
  getAllPosts: async () => {
    try {
      const response = await apiClient.get('/posts');
      // 确保返回的数据是数组
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('获取文章列表失败:', error);
      return [];
    }
  },

  getPost: async (filename: string) => {
    try {
      const response = await apiClient.get(`/posts/${filename}`);
      return response.data;
    } catch (error) {
      console.error('获取文章失败:', error);
      return null;
    }
  },

  createPost: async (postData: {
    title: string;
    content: string;
    tags?: string[];
    category?: string;
  }) => {
    try {
      const response = await apiClient.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('创建文章失败:', error);
      return null;
    }
  },

  updatePost: async (filename: string, postData: {
    title: string;
    content: string;
    tags?: string[];
    category?: string;
  }) => {
    try {
      const response = await apiClient.put(`/posts/${filename}`, postData);
      return response.data;
    } catch (error) {
      console.error('更新文章失败:', error);
      return null;
    }
  }
};

export const tagApi = {
  getAllTags: async () => {
    try {
      const response = await apiClient.get('/tags');
      return response.data;
    } catch (error) {
      console.error('获取标签失败:', error);
      return { tags: {}, tag_posts: {} };
    }
  }
};

export const archiveApi = {
  getArchive: async () => {
    try {
      const response = await apiClient.get('/archive');
      return response.data;
    } catch (error) {
      console.error('获取归档数据失败:', error);
      return { articles: [], stats: {} };
    }
  }
};

export const aboutApi = {
  getAbout: async () => {
    try {
      const response = await apiClient.get('/about');
      return response.data;
    } catch (error) {
      console.error('获取关于页面数据失败:', error);
      return {};
    }
  }
};

export default {
  auth: authApi,
  admin: adminApi,
  post: postApi,
  tag: tagApi,
  archive: archiveApi,
  about: aboutApi
};
