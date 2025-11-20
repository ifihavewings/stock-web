'use client'

import { clsx } from 'clsx'
import DataExplorationOutlinedIcon from '@mui/icons-material/DataExplorationOutlined'
import Menu from '@/components/Menu'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className={clsx(styles.container)}>
      {/* 头部区域 - 所有页面共享 */}
      <div className={clsx(styles.top)}>
        <div className={clsx(styles.logoSection)}>
          <DataExplorationOutlinedIcon 
            fontSize="large"
            className={clsx(styles.icon)} 
          />
          
          <div className={clsx(styles.brandInfo)}>
            <h1 className={clsx(styles.title)}>STOCK ANALYZE PLATFORM</h1>
            <p className={clsx(styles.description)}>A platform for analyzing stock data efficiently.</p>
          </div>
        </div>
      </div>
      
      {/* 主体区域 */}
      <div className={clsx(styles.bottom)}>
        {/* 左侧菜单 - 所有页面共享 */}
        <div className={styles.bottomLeft}>
          <Menu />
        </div>
        
        {/* 右侧内容区域 - 这里显示不同页面的内容 */}
        <div className={styles.bottomRight}>
          {children}
        </div>
      </div>
    </div>
  )
}