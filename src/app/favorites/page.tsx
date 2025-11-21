'use client'
import { Box, Typography } from "@mui/material"
import { useState, useEffect, useCallback } from "react"
import { getFavoriteStocks } from "@/app/apis/companies"
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
  isFavorite?: number;
}

export default function FavoritesPage() {
  const [tableData, setTableData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 页面初始加载时获取收藏数据
  useEffect(() => {
    loadFavoriteStocks(1, pageSize)
  }, [])

  // 分页变化处理
  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page)
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setCurrentPage(1)
      loadFavoriteStocks(1, newPageSize)
    } else {
      loadFavoriteStocks(page, newPageSize)
    }
  }

  const loadFavoriteStocks = useCallback(async (page: number = 1, size: number = 10) => {
    setLoading(true)
    try {
      const params = { page, pageSize: size };
      const response = await getFavoriteStocks(params);
      
      console.log('收藏股票API返回数据:', response)
      
      const dataArray = Array.isArray(response?.data?.data) ? response.data.data : []
      const paginationInfo = response?.data?.pagination || null
      
      setTableData(dataArray)
      setPagination(paginationInfo)
    } catch (error) {
      console.error('获取收藏股票列表失败:', error)
      setTableData([])
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
      <Typography variant="h4" component="h1" gutterBottom>
        我的收藏股票
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        这里显示您收藏的所有股票，您可以继续管理收藏状态或查看股票详情。
      </Typography>

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