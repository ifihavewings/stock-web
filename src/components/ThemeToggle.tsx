'use client'

import { IconButton } from '@mui/material'
import ContrastIcon from '@mui/icons-material/Contrast'
import { useTheme } from '@/theme/ThemeProvider'

export default function ThemeToggle() {
  const { mode, toggleTheme } = useTheme()

  return (
    <IconButton 
      onClick={toggleTheme}
      title={`切换到${mode === 'standard' ? '纯黑白' : '标准黑白'}主题`}
      sx={{ 
        '&:hover': {
          transform: 'scale(1.1)',
        }
      }}
    >
      <ContrastIcon />
    </IconButton>
  )
}