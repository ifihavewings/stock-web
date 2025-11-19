/**
 * FixedHeader 组件演示页面
 * 路由: /demo
 * 
 * 展示 FixedHeader 组件的各种使用方式：
 * 1. 简单标题
 * 2. 标题 + 副标题  
 * 3. 自定义内容
 * 4. 不同主题
 * 5. 各种配置选项
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import FixedHeader from '@/components/FixedHeader'

export default function HeaderDemoPage() {
  const [currentDemo, setCurrentDemo] = useState<string>('simple')
  const [menuOpen, setMenuOpen] = useState(false)

  // 演示配置
  const demos = [
    {
      id: 'simple',
      name: '简单标题',
      description: '最基本的标题显示'
    },
    {
      id: 'subtitle',
      name: '标题+副标题',
      description: '主标题和描述性副标题'
    },
    {
      id: 'back',
      name: '带返回按钮',
      description: '显示返回导航按钮'
    },
    {
      id: 'custom',
      name: '自定义内容',
      description: '传入自定义React组件'
    },
    {
      id: 'search',
      name: '搜索头部',
      description: '包含搜索框的头部'
    },
    {
      id: 'themes',
      name: '不同主题',
      description: '展示各种主题样式'
    }
  ]

  // 渲染当前演示的头部
  const renderCurrentHeader = () => {
    switch (currentDemo) {
      case 'simple':
        return <FixedHeader title="简单页面标题" />
        
      case 'subtitle':
        return (
          <FixedHeader 
            title="用户管理系统" 
            subtitle="管理和查看所有注册用户信息" 
          />
        )
        
      case 'back':
        return (
          <FixedHeader 
            title="用户详情"
            showBackButton={true}
            backUrl="/demo"
          />
        )
        
      case 'custom':
        return (
          <FixedHeader>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <div className="font-semibold">我的应用</div>
                <div className="text-xs text-gray-500">v2.1.0</div>
              </div>
            </div>
          </FixedHeader>
        )
        
      case 'search':
        return (
          <FixedHeader 
            title="搜索"
            theme="primary"
          >
            <div className="flex-1 max-w-md mx-4">
              <input
                type="search"
                placeholder="搜索用户、订单、产品..."
                className="w-full px-4 py-2 bg-white/90 border border-white/20 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </FixedHeader>
        )
        
      case 'themes':
        return (
          <FixedHeader 
            title="主题演示"
            subtitle="当前使用暗色主题"
            theme="dark"
            showMenuButton={true}
            onMenuClick={() => setMenuOpen(!menuOpen)}
          />
        )
        
      default:
        return <FixedHeader title="演示页面" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 渲染当前选中的头部演示 */}
      {renderCurrentHeader()}
      
      {/* 页面内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 页面说明 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            FixedHeader 组件演示
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            这个页面展示了 FixedHeader 组件的各种使用方式。点击下方的演示选项查看不同效果。
          </p>
        </div>

        {/* 演示选择器 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            选择演示类型：
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setCurrentDemo(demo.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  currentDemo === demo.id
                    ? 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-100'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:border-gray-600'
                }`}
              >
                <div className="font-medium">{demo.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {demo.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 代码示例 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            当前演示代码：
          </h3>
          <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{getCodeExample(currentDemo)}</code>
            </pre>
          </div>
        </div>

        {/* 属性说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            组件属性说明
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">属性名</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">类型</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">默认值</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-400">
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-2 font-mono">title</td>
                  <td className="py-3 px-2">string</td>
                  <td className="py-3 px-2">-</td>
                  <td className="py-3 px-2">主标题文本</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-2 font-mono">subtitle</td>
                  <td className="py-3 px-2">string</td>
                  <td className="py-3 px-2">-</td>
                  <td className="py-3 px-2">副标题文本</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-2 font-mono">children</td>
                  <td className="py-3 px-2">ReactNode</td>
                  <td className="py-3 px-2">-</td>
                  <td className="py-3 px-2">自定义内容</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-2 font-mono">showBackButton</td>
                  <td className="py-3 px-2">boolean</td>
                  <td className="py-3 px-2">false</td>
                  <td className="py-3 px-2">是否显示返回按钮</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-2 font-mono">theme</td>
                  <td className="py-3 px-2">'light' | 'dark' | 'primary' | 'transparent'</td>
                  <td className="py-3 px-2">'light'</td>
                  <td className="py-3 px-2">主题样式</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-mono">blur</td>
                  <td className="py-3 px-2">boolean</td>
                  <td className="py-3 px-2">true</td>
                  <td className="py-3 px-2">是否启用模糊背景</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 占位内容 - 用于测试滚动 */}
        <div className="mt-16 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            滚动测试内容
          </h3>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                这是第 {i + 1} 段测试内容，用于演示页面滚动时固定头部的效果。
                头部组件会始终固定在页面顶部，不会随着页面滚动而移动。
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 生成代码示例
function getCodeExample(demoType: string): string {
  switch (demoType) {
    case 'simple':
      return `<FixedHeader title="简单页面标题" />`
    
    case 'subtitle':
      return `<FixedHeader 
  title="用户管理系统" 
  subtitle="管理和查看所有注册用户信息" 
/>`
    
    case 'back':
      return `<FixedHeader 
  title="用户详情"
  showBackButton={true}
  backUrl="/demo"
/>`
    
    case 'custom':
      return `<FixedHeader>
  <div className="flex items-center space-x-4">
    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
      M
    </div>
    <div>
      <div className="font-semibold">我的应用</div>
      <div className="text-xs text-gray-500">v2.1.0</div>
    </div>
  </div>
</FixedHeader>`
    
    case 'search':
      return `<FixedHeader 
  title="搜索"
  theme="primary"
>
  <div className="flex-1 max-w-md mx-4">
    <input
      type="search"
      placeholder="搜索用户、订单、产品..."
      className="w-full px-4 py-2 bg-white/90 border border-white/20 rounded-lg..."
    />
  </div>
</FixedHeader>`
    
    case 'themes':
      return `<FixedHeader 
  title="主题演示"
  subtitle="当前使用暗色主题"
  theme="dark"
  showMenuButton={true}
  onMenuClick={() => setMenuOpen(!menuOpen)}
/>`
    
    default:
      return `<FixedHeader title="演示页面" />`
  }
}