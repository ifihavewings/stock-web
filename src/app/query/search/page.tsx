/**
 * 搜索页面
 * 路由: /query/search
 * 
 * 功能:
 * 1. 搜索表单
 * 2. 跳转到搜索结果页面
 * 3. 演示如何构造查询参数
 */

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SearchPage() {
  const router = useRouter()
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    category: 'all',
    sortBy: 'relevance',
    dateRange: '',
    minPrice: '',
    maxPrice: ''
  })

  /**
   * 表单提交处理
   * 构造查询参数并跳转到结果页面
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 构造查询参数
    const params = new URLSearchParams()
    
    // 只添加有值的参数
    if (searchForm.keyword.trim()) params.append('q', searchForm.keyword.trim())
    if (searchForm.category !== 'all') params.append('category', searchForm.category)
    if (searchForm.sortBy !== 'relevance') params.append('sort', searchForm.sortBy)
    if (searchForm.dateRange) params.append('dateRange', searchForm.dateRange)
    if (searchForm.minPrice) params.append('minPrice', searchForm.minPrice)
    if (searchForm.maxPrice) params.append('maxPrice', searchForm.maxPrice)
    
    // 添加默认参数
    params.append('page', '1')
    params.append('limit', '20')
    
    // 跳转到搜索结果页面
    router.push(`/query/search/results?${params.toString()}`)
  }

  /**
   * 快速搜索示例
   * 预设的搜索参数，用于演示
   */
  const quickSearchExamples: Array<{
    label: string;
    params: Record<string, string>;
  }> = [
    {
      label: '手机产品',
      params: { q: '手机', category: 'electronics', sort: 'price_asc' }
    },
    {
      label: '最新文章',
      params: { q: '技术', category: 'articles', sort: 'date_desc', dateRange: 'last_month' }
    },
    {
      label: '高价商品',
      params: { category: 'luxury', minPrice: '1000', sort: 'price_desc' }
    }
  ]

  const handleQuickSearch = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams(params)
    router.push(`/query/search/results?${urlParams.toString()}`)
  }

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔎 高级搜索
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          演示如何构造复杂的查询参数并进行页面跳转
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 搜索表单 */}
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 关键词搜索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                搜索关键词
              </label>
              <input
                type="text"
                value={searchForm.keyword}
                onChange={(e) => setSearchForm(prev => ({ ...prev, keyword: e.target.value }))}
                placeholder="输入要搜索的内容..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* 分类选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  搜索分类
                </label>
                <select
                  value={searchForm.category}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">所有分类</option>
                  <option value="electronics">电子产品</option>
                  <option value="clothing">服装</option>
                  <option value="books">图书</option>
                  <option value="articles">文章</option>
                  <option value="users">用户</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  排序方式
                </label>
                <select
                  value={searchForm.sortBy}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="relevance">相关度</option>
                  <option value="date_desc">最新优先</option>
                  <option value="date_asc">最旧优先</option>
                  <option value="price_asc">价格升序</option>
                  <option value="price_desc">价格降序</option>
                </select>
              </div>
            </div>

            {/* 日期和价格范围 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  时间范围
                </label>
                <select
                  value={searchForm.dateRange}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">不限时间</option>
                  <option value="today">今天</option>
                  <option value="last_week">最近一周</option>
                  <option value="last_month">最近一月</option>
                  <option value="last_year">最近一年</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  最低价格
                </label>
                <input
                  type="number"
                  value={searchForm.minPrice}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, minPrice: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  最高价格
                </label>
                <input
                  type="number"
                  value={searchForm.maxPrice}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, maxPrice: e.target.value }))}
                  placeholder="不限"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
              >
                🔍 开始搜索
              </button>
              
              <button
                type="button"
                onClick={() => setSearchForm({
                  keyword: '',
                  category: 'all',
                  sortBy: 'relevance',
                  dateRange: '',
                  minPrice: '',
                  maxPrice: ''
                })}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                重置
              </button>
            </div>
          </form>

          {/* URL 预览 */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              📋 生成的URL预览:
            </h3>
            <code className="text-sm text-green-600 dark:text-green-400 break-all">
              /query/search/results?
              {(() => {
                const params = new URLSearchParams()
                if (searchForm.keyword.trim()) params.append('q', searchForm.keyword.trim())
                if (searchForm.category !== 'all') params.append('category', searchForm.category)
                if (searchForm.sortBy !== 'relevance') params.append('sort', searchForm.sortBy)
                if (searchForm.dateRange) params.append('dateRange', searchForm.dateRange)
                if (searchForm.minPrice) params.append('minPrice', searchForm.minPrice)
                if (searchForm.maxPrice) params.append('maxPrice', searchForm.maxPrice)
                return params.toString() || '(无参数)'
              })()}
            </code>
          </div>
        </div>

        {/* 快速搜索示例 */}
        <div className="xl:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚡ 快速搜索示例
          </h2>
          
          <div className="space-y-3">
            {quickSearchExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(example.params)}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {example.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Object.entries(example.params).map(([key, value]) => (
                    value && <span key={key} className="mr-2">{key}={value}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* 直接链接示例 */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              🔗 直接链接示例
            </h3>
            <div className="space-y-2 text-sm">
              <Link 
                href="/query/search/results?q=iPhone&category=electronics"
                className="block text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                → 搜索iPhone
              </Link>
              <Link 
                href="/query/search/results?category=books&sort=date_desc"
                className="block text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                → 最新图书
              </Link>
              <Link 
                href="/query/search/results?minPrice=100&maxPrice=500&sort=price_asc"
                className="block text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                → 价格区间 100-500
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}