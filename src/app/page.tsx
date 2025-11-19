
/**
 * 首页组件 - 演示 Next.js App Router
 * 路由: / (根路径)
 * 
 * 功能:
 * 1. 展示项目介绍
 * 2. 提供到各模块的导航链接
 * 3. 演示基础路由跳转
 */

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          CHINA STOCK MARKET ANALIZE PLATFORM
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* 查询模块 */}
          <Link 
            href="/query"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              查询中心
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              A 股市场 (两市主板、创业板 )
            </p>
          </Link>
          
          {/* 组件演示 */}
          <Link 
            href="/demo"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-3xl mb-4">🧩</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              组件演示
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              FixedHeader 组件使用示例
            </p>
          </Link>
          
          {/* Dashboard */}
          <Link 
            href="/dashboard"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              仪表板
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              数据分析和管理面板
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
