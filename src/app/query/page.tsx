/**
 * 查询模块首页
 * 路由: /query
 * 
 * 这个页面展示:
 * 1. 查询模块概览
 * 2. 各种跳转方式的示例
 * 3. 参数传递的方法
 */

'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FixedHeader from '@/components/FixedHeader'

export default function QueryHomePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [userId, setUserId] = useState('')

  /**
   * 编程式导航示例1: 简单跳转
   * 使用 router.push() 进行页面跳转
   */
  const handleNavigateToUsers = () => {
    router.push('/query/users')
  }

  /**
   * 编程式导航示例2: 带查询参数的跳转
   * 构造URL查询字符串进行跳转
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // 方法1: 手动构造查询字符串
      const queryParams = new URLSearchParams({
        q: searchTerm,
        category: 'all',
        page: '1'
      })
      router.push(`/query/search/results?${queryParams.toString()}`)
    }
  }

  /**
   * 编程式导航示例3: 动态路由跳转
   * 跳转到用户详情页，使用路径参数
   */
  const handleUserDetailNavigate = () => {
    if (userId) {
      router.push(`/query/users/${userId}`)
    }
  }

  return (
    <>
      {/* 使用 FixedHeader 组件 */}
      <FixedHeader 
        title="数据查询中心"
        subtitle="FIND STOCKS"
        showBackButton={true}
        backUrl="/"
        theme="primary"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        1
    </div>
    </>
  )
}