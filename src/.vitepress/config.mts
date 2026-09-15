import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const basePath = process.env.VITEPRESS_BASE_PATH || '/java-doc/'

export default withMermaid(defineConfig({
  title: 'snz1-java',
  description: 'snz1 Java 微服务基础框架官方文档',
  lang: 'zh-CN',
  base: basePath,
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,

  vite: {
    optimizeDeps: {
      include: ['mermaid', 'fastdom']
    }
  },

  themeConfig: {
    nav: [
      { text: '框架概览', link: '/overview/' },
      { text: '使用指南', link: '/guide/getting-started' },
      { text: '基础框架', link: '/framework/spring-boot3-app' },
      { text: '中间件', link: '/middleware/opensearch-cli' },
      { text: 'SDK', link: '/sdk/sc-client-api' },
      { text: '最佳实践', link: '/best-practices/sso-auth' },
      { text: '迁移指南', link: '/migration/overview' },
      {
        text: 'V3.0',
        items: [
          { text: 'V3.0（当前版本）', link: '/overview/' },
          { text: '变更日志', link: '/reference/changelog' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '使用指南',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '数据库自动升级建表', link: '/guide/database-schema' },
            { text: '安全认证与 SSO', link: '/guide/security-sso' },
            { text: '缓存与分布式锁', link: '/guide/cache-lock' },
            { text: '动态配置管理', link: '/guide/dynamic-config' },
            { text: '全局异常处理', link: '/guide/error-handling' },
            { text: 'WebSocket 实时通信', link: '/guide/websocket' }
          ]
        }
      ],
      '/overview/': [
        {
          text: '框架概览',
          items: [
            { text: '总览', link: '/overview/' }
          ]
        }
      ],
      '/framework/': [
        {
          text: '基础框架',
          collapsed: false,
          items: [
            { text: 'spring-boot3-app 父 POM', link: '/framework/spring-boot3-app' },
            { text: 'utility-core 核心', link: '/framework/utility-core' },
            { text: 'utility-tools 工具', link: '/framework/utility-tools' },
            { text: 'utility-config 配置', link: '/framework/utility-config' },
            { text: 'utility-security 安全', link: '/framework/utility-security' },
            { text: 'utility-data 数据访问', link: '/framework/utility-data' },
            { text: 'utility-redis 缓存', link: '/framework/utility-redis' },
            { text: 'utility-websocket WebSocket', link: '/framework/utility-websocket' },
            { text: 'utility-mvc MVC增强', link: '/framework/utility-mvc' },
            { text: 'utility-all 聚合包', link: '/framework/utility-all' },
            { text: 'apihelper HTTP 客户端', link: '/framework/apihelper' }
          ]
        }
      ],
      '/middleware/': [
        {
          text: '中间件',
          collapsed: false,
          items: [
            { text: 'opensearch-cli', link: '/middleware/opensearch-cli' },
            { text: 'elasticsearch-cli', link: '/middleware/elasticsearch-cli' },
            { text: 'jdbcrest', link: '/middleware/jdbcrest' }
          ]
        }
      ],
      '/sdk/': [
        {
          text: 'SDK 库',
          collapsed: false,
          items: [
            { text: 'sc-client-api', link: '/sdk/sc-client-api' },
            { text: 'admin-api', link: '/sdk/admin-api' }
          ]
        }
      ],
      '/best-practices/': [
        {
          text: '业务服务最佳实践',
          collapsed: false,
          items: [
            { text: 'SSO 认证服务', link: '/best-practices/sso-auth' },
            { text: '配置中心', link: '/best-practices/config-center' },
            { text: 'Dashboard 服务', link: '/best-practices/dashboard' },
            { text: '工作流服务', link: '/best-practices/workflow' },
            { text: '用户权限管理', link: '/best-practices/user-permission' },
            { text: '数据同步服务', link: '/best-practices/data-sync' }
          ]
        }
      ],
      '/migration/': [
        {
          text: '迁移指南',
          collapsed: false,
          items: [
            { text: '迁移总览', link: '/migration/overview' },
            { text: '依赖变更', link: '/migration/dependency-changes' },
            { text: '常见问题', link: '/migration/common-issues' }
          ]
        }
      ],
      '/reference/': [
        {
          text: '附录',
          collapsed: false,
          items: [
            { text: 'FAQ', link: '/reference/faq' },
            { text: '变更日志', link: '/reference/changelog' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/snz1' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: '长沙慧码至一信息科技有限公司',
      copyright: '版权所有 © 2026'
    },

    outline: {
      label: '本页目录'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdated: {
      text: '最后更新于'
    }
  }
}), {
  mermaid: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#e3f2fd',
      primaryTextColor: '#1a1a1a',
      primaryBorderColor: '#1976d2',
      lineColor: '#1976d2',
      secondaryColor: '#e0f2f1',
      tertiaryColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    themeCSS: '.node rect { rx: 4; ry: 4; }'
  },
  copy: {
    text: '复制',
    successText: '已复制'
  },
  download: {
    text: '下载',
    successText: '已下载'
  },
  preview: {
    text: '预览'
  },
  zoom: {
    text: '缩放',
    resetText: '重置'
  }
})
