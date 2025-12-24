'use client'

import { clsx } from 'clsx'
import DataExplorationOutlinedIcon from '@mui/icons-material/DataExplorationOutlined'
import { IconButton, Typography } from '@mui/material'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import Menu from '@/components/Menu'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const theme = useMuiTheme()

  const logoClickHandler = () => {
    window.location.href = '/'
  }

  return (
    <div className={clsx(styles.container)}>
      {/* 头部区域 - 所有页面共享 */}
      <div 
        className={clsx(styles.top)}
        style={{ 
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <div 
          className={clsx(styles.logoSection)} 
          onClick={logoClickHandler}
          style={{ 
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = theme.palette.action.hover
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <IconButton size="large" sx={{ color: theme.palette.primary.main }}>
            <DataExplorationOutlinedIcon 
              fontSize="large"
              className={clsx(styles.icon)} 
            />
          </IconButton>
          
          <div className={clsx(styles.brandInfo)}>
            <Typography 
              variant="h4" 
              component="h1"
              className={clsx(styles.title)}
              sx={{ color: theme.palette.text.primary }}
            >
              STOCK ANALYZE PLATFORM
            </Typography>
            <Typography 
              variant="body2" 
              className={clsx(styles.description)}
              sx={{ color: theme.palette.text.secondary }}
            >
              A platform for analyzing stock data efficiently.
            </Typography>
          </div>
        </div>
      </div>
      
      {/* 主体区域 */}
      <div className={clsx(styles.bottom)}>
        {/* 左侧菜单 - 所有页面共享 */}
        <div 
          className={styles.bottomLeft}
          style={{ 
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`
          }}
        >
          <Menu />
        </div>
        
        {/* 右侧内容区域 - 这里显示不同页面的内容 */}
        <div 
          className={styles.bottomRight}
          style={{ backgroundColor: theme.palette.background.default }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}