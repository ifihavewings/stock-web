'use client'
import { Box, TextField } from "@mui/material"
import { useState, useEffect, useCallback } from "react"
import styles from './page.module.css'
export default function StockListPage() {
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')

  // 防抖处理：输入停止500ms后才触发搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  // 当防抖值变化时执行搜索
  useEffect(() => {
    if (debouncedSearchValue) {
      handleSearch(debouncedSearchValue)
    }
  }, [debouncedSearchValue])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
    console.log('输入值实时变化：', value)
  }

  const handleSearch = useCallback((searchTerm: string) => {
    console.log('执行搜索：', searchTerm)
    // 在这里调用 API 进行搜索
    // fetchStocks(searchTerm)
  }, [])

  return (
    <Box sx={{
      p: 2,
      height: '100%'
    }}>
        <TextField 
          label="stock code / name" 
          variant="outlined" 
          value={searchValue}
          autoFocus
          onChange={handleSearchChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchValue)
            }
          }}
          placeholder="enter stock code or name"
          fullWidth
          size="small"
        />
        
        {debouncedSearchValue && (
          <Box sx={{ mt: 2 }}>
            <p className={styles.searching}>正在搜索：{debouncedSearchValue}</p>
          </Box>
        )}
    </Box>
  )
}