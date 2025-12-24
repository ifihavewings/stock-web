'use client'
import { Box, Typography } from "@mui/material"
import { useState, useEffect, useCallback } from "react"
import { getFavoriteStocks } from "@/app/apis/companies"
import FavoriteStockList from "@/components/FavoriteStockList"

// 收藏股票数据类型（包含交易数据）
interface FavoriteStockData {
  stockCode: string;
  stockSymbol: string;
  companyArea: string;
  industrySector: string;
  marketType: string;
  stockExchange: string;
  listingDate: string;
  isFavorite?: number;
  // 交易数据
  tradingDate?: string;
  openingPrice?: number | null;
  closingPrice?: number | null;
  highestPrice?: number | null;
  lowestPrice?: number | null;
  previousClosingPrice?: number | null;
  priceChange?: number | null;
  priceChangePercentage?: number | null;
  tradingVolume?: number | null;
  tradingAmount?: number | null;
  turnoverRate?: number | null;
  peRatio?: number | null;
  pbRatio?: number | null;
  volumeRatio?: number | null;
  totalMarketValue?: number | null;
  circulatingMarketValue?: number | null;
}

export default function FavoritesPage() {
  const [tableData, setTableData] = useState<FavoriteStockData[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<any>(null)
  const [latestTradingDate, setLatestTradingDate] = useState<string | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

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
      const tradingDate = response?.data?.latestTradingDate || undefined
      
      setTableData(dataArray)
      setPagination(paginationInfo)
      setLatestTradingDate(tradingDate)
    } catch (error) {
      console.error('获取收藏股票列表失败:', error)
      setTableData([])
      setPagination(null)
      setLatestTradingDate(undefined)
    } finally {
      setLoading(false)
    }
  }, [])

  // 收藏状态变化时重新加载数据
  const handleFavoriteChange = useCallback(() => {
    loadFavoriteStocks(currentPage, pageSize)
  }, [currentPage, pageSize, loadFavoriteStocks])

  return (
    <Box sx={{
      p: 2,
      height: '100%'
    }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        我的收藏
      </Typography>

      <Box sx={{ mt: 2 }}>
        <FavoriteStockList 
          tableData={tableData} 
          latestTradingDate={latestTradingDate}
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
          onFavoriteChange={handleFavoriteChange}
        />
      </Box>
    </Box>
  )
}