'use client'

import { clsx } from 'clsx'
import styles from './shared-layout.module.css'
import DataExplorationOutlinedIcon from '@mui/icons-material/DataExplorationOutlined'
import Menu from '@/components/Menu'

interface SharedLayoutProps {
  children: React.ReactNode
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div className={clsx(styles.container)}>
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
      
      <div className={clsx(styles.bottom)}>
        <div className={styles.bottomLeft}>
          <Menu />
        </div>
        <div className={styles.bottomRight}>
          {children} {/* 这里就是 router-view 的内容 */}
        </div>
      </div>
    </div>
  )
}