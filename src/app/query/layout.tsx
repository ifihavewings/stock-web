/**
 * 查询模块布局组件
 * 这个布局会被所有 /query/** 路径下的页面共享
 * 
 * 路由说明:
 * - 这个文件对应 /query/* 的所有子路由
 * - layout.tsx 提供共享的 UI 结构（导航、侧边栏等）
 * - children 会渲染对应的页面内容
 */

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function QueryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 获取当前路径，用于高亮当前激活的导航项
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              {/* 返回首页链接 */}
              <Link 
                href="/" 
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600"
              >
                ← 首页
              </Link>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                🔍 数据查询中心
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 左侧导航栏 */}
          <aside className="lg:col-span-1">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                查询导航
              </h2>
              
              <div className="space-y-2">
                {/* 查询首页 */}
                <Link 
                  href="/query"
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === '/query' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  🏠 查询首页
                </Link>
              </div>

            </nav>
          </aside>

          {/* 主要内容区域 */}
          <main className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow min-h-[600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}