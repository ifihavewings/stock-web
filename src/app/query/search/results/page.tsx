/**
 * 搜索结果页面
 * 路由: /query/search/results
 * 
 * 功能:
 * 1. 接收和解析URL查询参数
 * 2. 显示搜索结果
 * 3. 提供分页和筛选功能
 * 4. 演示如何修改URL参数而不重新加载页面
 */

'use client'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

// 模拟搜索结果数据
const mockResults = [
  { id: 1, title: 'iPhone 15 Pro', type: '产品', category: 'electronics', price: 7999, description: '最新的iPhone，配备A17 Pro芯片' },
  { id: 2, title: '技术文章：React最佳实践', type: '文章', category: 'articles', price: 0, description: '深入了解React开发的最佳实践' },
  { id: 3, title: 'MacBook Air M3', type: '产品', category: 'electronics', price: 8999, description: '轻薄便携的笔记本电脑' },
  { id: 4, title: 'JavaScript进阶教程', type: '图书', category: 'books', price: 89, description: '从基础到高级的JavaScript教程' },
  { id: 5, title: '用户 张三', type: '用户', category: 'users', price: 0, description: '资深开发工程师' },
]

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // 从URL获取搜索参数
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || 'all'
  const sortBy = searchParams.get('sort') || 'relevance'
  const dateRange = searchParams.get('dateRange') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const currentPage = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const [results, setResults] = useState(mockResults)
  const [loading, setLoading] = useState(false)

  /**
   * 更新URL参数的通用函数
   * 这个函数演示如何修改URL参数而不重新加载页面
   */
  const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // 更新或删除参数
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    
    // 使用 router.replace 来更新URL而不添加到历史记录
    router.replace(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  /**
   * 分页处理
   */
  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() })
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * 排序处理
   */
  const handleSortChange = (newSort: string) => {
    updateSearchParams({ sort: newSort, page: '1' }) // 重置到第一页
  }

  /**
   * 分类筛选处理
   */
  const handleCategoryChange = (newCategory: string) => {
    updateSearchParams({ category: newCategory, page: '1' })
  }

  /**
   * 模拟搜索API调用
   */
  useEffect(() => {
    setLoading(true)
    // 模拟API调用延迟
    const timer = setTimeout(() => {
      // 这里应该是真实的API调用
      // 根据搜索参数过滤结果
      let filteredResults = mockResults
      
      if (query) {
        filteredResults = filteredResults.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        )
      }
      
      if (category !== 'all') {
        filteredResults = filteredResults.filter(item => item.category === category)
      }
      
      if (minPrice) {
        filteredResults = filteredResults.filter(item => item.price >= parseInt(minPrice))
      }
      
      if (maxPrice) {
        filteredResults = filteredResults.filter(item => item.price <= parseInt(maxPrice))
      }
      
      setResults(filteredResults)
      setLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [query, category, sortBy, minPrice, maxPrice])

  /**
   * 清空搜索
   */
  const clearSearch = () => {
    router.push('/query/search')
  }

  return (
    <div className="p-8">
      {/* 搜索信息头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            搜索结果
          </h1>
          <Link 
            href="/query/search"
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-gray-700"
          >
            ← 返回搜索
          </Link>
        </div>
        
        {/* 当前搜索条件显示 */}
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            🔍 当前搜索条件:
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {query && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded dark:bg-blue-800 dark:text-blue-200">
                关键词: {query}
              </span>
            )}
            {category !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded dark:bg-green-800 dark:text-green-200">
                分类: {category}
              </span>
            )}
            {sortBy !== 'relevance' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded dark:bg-purple-800 dark:text-purple-200">
                排序: {sortBy}
              </span>
            )}
            {minPrice && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded dark:bg-orange-800 dark:text-orange-200">
                最低价: ¥{minPrice}
              </span>
            )}
            {maxPrice && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded dark:bg-orange-800 dark:text-orange-200">
                最高价: ¥{maxPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        
        {/* 分类筛选 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">分类:</label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">全部</option>
            <option value="electronics">电子产品</option>
            <option value="articles">文章</option>
            <option value="books">图书</option>
            <option value="users">用户</option>
          </select>
        </div>

        {/* 排序选择 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">排序:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="relevance">相关度</option>
            <option value="date_desc">最新优先</option>
            <option value="price_asc">价格升序</option>
            <option value="price_desc">价格降序</option>
          </select>
        </div>

        {/* 清空搜索 */}
        <button
          onClick={clearSearch}
          className="px-4 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          清空搜索
        </button>

        {/* 结果统计 */}
        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          找到 <span className="font-medium">{results.length}</span> 个结果
        </div>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">搜索中...</p>
        </div>
      ) : (
        <>
          {/* 搜索结果列表 */}
          <div className="space-y-4 mb-8">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  没有找到相关结果
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  试试调整搜索条件或使用其他关键词
                </p>
              </div>
            ) : (
              results.map((result) => (
                <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600">
                          {result.title}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded dark:bg-gray-700 dark:text-gray-300">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>分类: {result.category}</span>
                        {result.price > 0 && (
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            ¥{result.price}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="ml-4 px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                      查看详情
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 分页 */}
          {results.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white"
              >
                上一页
              </button>
              
              {[1, 2, 3].map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= 3}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {/* URL参数说明 */}
      <div className="mt-12 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          📖 当前URL参数解析:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">获取到的参数:</h4>
            <div className="space-y-1 font-mono text-gray-600 dark:text-gray-400">
              <div>q: {query || '(空)'}</div>
              <div>category: {category}</div>
              <div>sort: {sortBy}</div>
              <div>page: {currentPage}</div>
              {minPrice && <div>minPrice: {minPrice}</div>}
              {maxPrice && <div>maxPrice: {maxPrice}</div>}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">使用的Hook:</h4>
            <div className="text-gray-600 dark:text-gray-400 space-y-1">
              <div>• <code>useSearchParams()</code> - 读取URL参数</div>
              <div>• <code>useRouter()</code> - 页面跳转</div>
              <div>• <code>usePathname()</code> - 获取当前路径</div>
              <div>• <code>router.replace()</code> - 更新URL不刷新页面</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}