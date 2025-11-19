/**
 * 固定头部组件 - FixedHeader
 * 
 * 功能特性:
 * 1. 固定定位在页面顶部
 * 2. 支持传入简单标题文本
 * 3. 支持传入自定义 React 节点内容
 * 4. 响应式设计，适配移动端
 * 5. 支持暗色模式
 * 6. 可自定义样式类名
 * 
 * 使用方式:
 * - 简单标题: <FixedHeader title="我的标题" />
 * - 自定义内容: <FixedHeader>{<div>自定义内容</div>}</FixedHeader>
 * - 混合使用: <FixedHeader title="标题" subtitle="副标题">{自定义内容}</FixedHeader>
 */

import React from 'react'
import Link from 'next/link'

// 定义组件的属性类型
interface FixedHeaderProps {
  /** 主标题文本 - 简单字符串 */
  title?: string
  
  /** 副标题文本 - 显示在主标题下方 */
  subtitle?: string
  
  /** 自定义内容 - React 节点，可以是任何 JSX */
  children?: React.ReactNode
  
  /** 是否显示返回按钮 */
  showBackButton?: boolean
  
  /** 返回按钮的目标路径 */
  backUrl?: string
  
  /** 是否显示菜单按钮（移动端） */
  showMenuButton?: boolean
  
  /** 菜单按钮点击事件 */
  onMenuClick?: () => void
  
  /** 自定义 CSS 类名 */
  className?: string
  
  /** 头部背景色主题 */
  theme?: 'light' | 'dark' | 'primary' | 'transparent'
  
  /** 是否启用模糊背景效果 */
  blur?: boolean
}

/**
 * 固定头部组件
 */
export default function FixedHeader({
  title,
  subtitle,
  children,
  showBackButton = false,
  backUrl = '/',
  showMenuButton = false,
  onMenuClick,
  className = '',
  theme = 'light',
  blur = true
}: FixedHeaderProps) {
  
  // 编码修复函数
  const fixEncoding = (str?: string): string => {
    if (!str) return ''
    try {
      // 检测并修复常见编码问题
      if (str.includes('�') || /[\x00-\x1F\x7F-\x9F]/.test(str)) {
        return decodeURIComponent(escape(str))
      }
      return str
    } catch (error) {
      console.warn('编码修复失败:', error)
      return str
    }
  }
  
  // 根据主题生成样式类
  const getThemeClasses = () => {
    const baseClasses = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300'
    
    switch (theme) {
      case 'dark':
        return `${baseClasses} bg-gray-900 text-white border-gray-700`
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white border-blue-500`
      case 'transparent':
        return `${baseClasses} bg-transparent text-gray-900 dark:text-white border-transparent`
      case 'light':
      default:
        return `${baseClasses} bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700`
    }
  }
  
  // 模糊背景效果类
  const blurClasses = blur ? 'backdrop-blur-md bg-opacity-90 dark:bg-opacity-90' : ''
  
  return (
    <>
      {/* 固定头部 */}
      <header className={`${getThemeClasses()} ${blurClasses} border-b ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* 左侧区域：返回按钮 + 标题 */}
            <div className="flex items-center space-x-4">
              {/* 返回按钮 */}
              {showBackButton && (
                <Link
                  href={backUrl}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="返回"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              )}
              
              {/* 标题区域 */}
              {(title || subtitle) && (
                <div className="flex flex-col">
                  {title && (
                    <h1 className="text-lg font-semibold leading-tight">
                      {fixEncoding(title)}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                      {fixEncoding(subtitle)}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* 中间区域：自定义内容 */}
            {children && (
              <div className="flex-1 flex items-center justify-center px-4">
                {children}
              </div>
            )}
            
            {/* 右侧区域：菜单按钮或其他操作 */}
            <div className="flex items-center space-x-2">
              {/* 菜单按钮（移动端） */}
              {showMenuButton && (
                <button
                  onClick={onMenuClick}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
                  aria-label="打开菜单"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
     
    </>
  )
}

/**
 * 使用示例：
 * 
 * // 1. 简单标题
 * <FixedHeader title="页面标题" />
 * 
 * // 2. 标题 + 副标题
 * <FixedHeader 
 *   title="用户管理" 
 *   subtitle="管理系统用户信息" 
 * />
 * 
 * // 3. 带返回按钮
 * <FixedHeader 
 *   title="用户详情" 
 *   showBackButton={true} 
 *   backUrl="/users" 
 * />
 * 
 * // 4. 自定义内容
 * <FixedHeader>
 *   <div className="flex items-center space-x-4">
 *     <img src="/logo.png" className="h-8" />
 *     <span className="font-bold">我的应用</span>
 *   </div>
 * </FixedHeader>
 * 
 * // 5. 混合使用
 * <FixedHeader 
 *   title="搜索结果" 
 *   theme="primary"
 *   blur={true}
 * >
 *   <input 
 *     type="search" 
 *     placeholder="搜索..." 
 *     className="px-3 py-1 rounded-md border"
 *   />
 * </FixedHeader>
 * 
 * // 6. 暗色主题
 * <FixedHeader 
 *   title="设置" 
 *   theme="dark" 
 *   showMenuButton={true}
 *   onMenuClick={() => setMenuOpen(true)}
 * />
 */