'use client'
import { Box, TextField } from "@mui/material"
import { useState, useEffect, useCallback } from "react"
import styles from './page.module.css'
import {listCompaniesByIdOrCode} from "@/app/apis/companies"
import StockList from "@/components/StockList"

// 定义股票数据类型
interface StockData {
  stockCode: string;
  stockSymbol: string;
  companyArea: string;
  industrySector: string;
  marketType: string;
  stockExchange: string;
  listingDate: string;
  totalMarketValue: string | null;
  circulatingMarketValue: string | null;
  totalShares: string | null;
  circulatingShares: string | null;
  lastUpdateTimestamp: string | null;
}

export default function StockListPage() {
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [tableData, setTableData] = useState<StockData[]>([]) // 明确定义为数组类型
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<any>(null) // 存储分页信息
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 防抖处理：输入停止500ms后才触发搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  // 页面初始加载时获取默认数据
  useEffect(() => {
    // 页面加载时获取第一页数据
    handleSearch('', 1, pageSize)
  }, [])

  // 当防抖值变化时执行搜索（重置到第一页）
  useEffect(() => {
    setCurrentPage(1) // 搜索时重置到第一页
    handleSearch(debouncedSearchValue, 1, pageSize)
  }, [debouncedSearchValue])

  // 分页变化处理
  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page)
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setCurrentPage(1) // 改变页面大小时重置到第一页
      handleSearch(debouncedSearchValue, 1, newPageSize)
    } else {
      handleSearch(debouncedSearchValue, page, newPageSize)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
    console.log('输入值实时变化：', value)
  }

  const handleSearch = useCallback(async (searchTerm: string, page: number = 1, size: number = 10) => {
    setLoading(true)
    try {
      const params = searchTerm 
        ? { keyWord: searchTerm, page, pageSize: size }
        : { page, pageSize: size } // 空搜索时只传分页参数
      
      const response = await listCompaniesByIdOrCode(params)
      console.log('API返回数据:', response) // 调试日志
      
      // 根据实际的API响应结构：response.data.data 是实际的数组数据
      const dataArray = Array.isArray(response?.data?.data) ? response.data.data : []
      const paginationInfo = response?.data?.pagination || null
      
      setTableData(dataArray)
      setPagination(paginationInfo)
    } catch (error) {
      console.error('listCompaniesByIdOrCode error:', error)
      setTableData([]) // 错误时设置空数组
      setPagination(null)
    } finally {
      setLoading(false)
    }
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
          placeholder="enter stock code or name"
          fullWidth
          size="small"
        />

        <Box sx={{ mt: 2 }}>
          <StockList 
            tableData={tableData} 
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </Box>
    </Box>
  )
}