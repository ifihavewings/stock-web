'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  CircularProgress
} from '@mui/material'
import { TrendingUp, TrendingDown, ShowChart, ArrowUpward, ArrowDownward, UnfoldMore, Timeline, Close } from '@mui/icons-material'
import { queryDailyKLineData } from '@/app/apis/stocks'
import { KLineChartContainer } from '@/components/KLineChart/KLineChartContainer'

// 定义股票行情数据类型
interface StockMarketData {
  recordId: number
  stockCode: string
  tradingDate: string
  openingPrice: number
  highestPrice: number
  lowestPrice: number
  closingPrice: number
  previousClosingPrice: number
  priceChange: number
  priceChangePercentage: number
  tradingVolume: number
  tradingAmount: number
  turnoverRate: number
  peRatio: number
  pbRatio: number
  company?: {
    stockSymbol: string
    companyArea: string
    industrySector: string
    marketType: string
  }
}

interface MarketQueryParams {
  stockCodeLike?: string
  stockNameLike?: string
  industrySectorLike?: string
  startDate?: string
  endDate?: string
  minClosePrice?: number
  maxClosePrice?: number
  minVolume?: number
  maxVolume?: number
  sortField?: string
  sortDirection?: 'ASC' | 'DESC'
  page?: number
  pageSize?: number
}

const sortOptions = [
  { value: 'change_percent', label: '涨跌幅' },
  { value: 'close_price', label: '收盘价' },
  { value: 'volume', label: '成交量' },
  { value: 'amount', label: '成交额' },
  { value: 'turnover_rate', label: '换手率' },
  { value: 'pe_ratio', label: '市盈率' },
  { value: 'pb_ratio', label: '市净率' },
  { value: 'trade_date', label: '交易日期' },
]

export default function MarketPage() {
  const [data, setData] = useState<StockMarketData[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  
  // 搜索和筛选参数
  const [searchParams, setSearchParams] = useState<MarketQueryParams>({
    page: 1,
    pageSize: 20,
    sortField: 'change_percent',
    sortDirection: 'DESC'
  })

  // 防抖搜索
  const [searchValue, setSearchValue] = useState('')
  
  // K线图弹窗状态
  const [klineDialogOpen, setKlineDialogOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockMarketData | null>(null)
  const [industrySearchValue, setIndustrySearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [debouncedIndustrySearchValue, setDebouncedIndustrySearchValue] = useState('')

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchValue])

  // 行业搜索防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIndustrySearchValue(industrySearchValue)
    }, 500)
    return () => clearTimeout(timer)
  }, [industrySearchValue])

  // 当搜索值变化时，重置到第一页
  useEffect(() => {
    const searchQuery = debouncedSearchValue.trim()
    const industryQuery = debouncedIndustrySearchValue.trim()
    // 如果搜索值包含数字，优先作为股票代码搜索，否则作为简称搜索
    const hasNumbers = /\d/.test(searchQuery)
    
    setSearchParams(prev => ({
      ...prev,
      stockCodeLike: hasNumbers && searchQuery ? searchQuery : undefined,
      stockNameLike: !hasNumbers && searchQuery ? searchQuery : undefined,
      industrySectorLike: industryQuery || undefined,
      page: 1
    }))
    setPage(1)
  }, [debouncedSearchValue, debouncedIndustrySearchValue])

  // 获取行情数据
  const fetchMarketData = useCallback(async (params: MarketQueryParams) => {
    setLoading(true)
    try {
      const response = await queryDailyKLineData(params)
      if (response.success) {
        setData(response.data.data || [])
        setTotal(response.data.total || 0)
        setTotalPages(response.data.totalPages || 0)
      }
    } catch (error) {
      console.error('获取行情数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 监听搜索参数变化
  useEffect(() => {
    fetchMarketData(searchParams)
  }, [searchParams, fetchMarketData])

  // 处理分页变化
  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage)
    setSearchParams(prev => ({ ...prev, page: newPage }))
  }

  // 处理表头排序点击
  const handleHeaderSort = (field: string) => {
    const currentSortField = searchParams.sortField || 'change_percent'
    const currentDirection = searchParams.sortDirection || 'DESC'
    
    let newDirection: 'ASC' | 'DESC' = 'DESC'
    
    // 如果点击的是当前排序字段，则切换排序方向
    if (currentSortField === field) {
      newDirection = currentDirection === 'DESC' ? 'ASC' : 'DESC'
    }
    
    handleSortChange(field, newDirection)
  }

  // 获取排序图标
  const getSortIcon = (field: string) => {
    const currentSortField = searchParams.sortField || 'change_percent'
    const currentDirection = searchParams.sortDirection || 'DESC'
    
    if (currentSortField !== field) {
      return <UnfoldMore sx={{ fontSize: 16, color: '#ccc', ml: 0.5 }} />
    }
    
    return currentDirection === 'DESC' 
      ? <ArrowDownward sx={{ fontSize: 16, color: 'primary.main', ml: 0.5 }} />
      : <ArrowUpward sx={{ fontSize: 16, color: 'primary.main', ml: 0.5 }} />
  }

  // 处理排序变化
  const handleSortChange = (field: string, direction: 'ASC' | 'DESC') => {
    setSearchParams(prev => ({
      ...prev,
      sortField: field,
      sortDirection: direction,
      page: 1
    }))
    setPage(1)
  }

  // 处理每页数量变化
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setSearchParams(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 1
    }))
    setPage(1)
  }

  // 格式化数字
  const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined) return '-'
    
    // 确保value是数字类型
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
    
    if (isNaN(numValue)) return '-'
    if (numValue === 0) return '0'
    
    if (Math.abs(numValue) >= 100000000) {
      return `${(numValue / 100000000).toFixed(1)}亿`
    } else if (Math.abs(numValue) >= 10000) {
      return `${(numValue / 10000).toFixed(1)}万`
    }
    return numValue.toFixed(decimals)
  }

  // 格式化涨跌幅颜色
  const getPriceChangeColor = (change: number | null | undefined): string => {
    if (change === null || change === undefined) return '#666'
    
    // 确保change是数字类型
    const numChange = typeof change === 'string' ? parseFloat(change) : Number(change)
    
    if (isNaN(numChange) || numChange === 0) return '#666'
    return numChange > 0 ? '#f44336' : '#4caf50'
  }

  // 清除筛选条件
  const handleClearFilters = () => {
    setSearchValue('')
    setIndustrySearchValue('')
    setSearchParams({
      page: 1,
      pageSize: 20,
      sortField: 'change_percent',
      sortDirection: 'DESC'
    })
    setPage(1)
  }

  // 打开K线图弹窗
  const handleOpenKlineChart = (stock: StockMarketData) => {
    setSelectedStock(stock)
    setKlineDialogOpen(true)
  }

  // 关闭K线图弹窗
  const handleCloseKlineChart = () => {
    setKlineDialogOpen(false)
    setSelectedStock(null)
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      p: 1.5, 
      overflow: 'hidden' 
    }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 1.5, flexShrink: 0 }}>
        📈 股票行情
      </Typography>

      {/* 搜索和筛选区域 */}
      <Card sx={{ mb: 1.5, flexShrink: 0 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                label="搜索股票代码或简称"
                variant="outlined"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="例如: 000001 或 平安"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                label="搜索行业板块"
                variant="outlined"
                value={industrySearchValue}
                onChange={(e) => setIndustrySearchValue(e.target.value)}
                placeholder="例如: 银行 或 科技"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>排序字段</InputLabel>
                <Select
                  value={searchParams.sortField || 'change_percent'}
                  label="排序字段"
                  onChange={(e) => handleSortChange(e.target.value, searchParams.sortDirection || 'DESC')}
                >
                  {sortOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <FormControl fullWidth size="small">
                <InputLabel>方向</InputLabel>
                <Select
                  value={searchParams.sortDirection || 'DESC'}
                  label="方向"
                  onChange={(e) => handleSortChange(searchParams.sortField || 'change_percent', e.target.value as 'ASC' | 'DESC')}
                >
                  <MenuItem value="DESC">降序</MenuItem>
                  <MenuItem value="ASC">升序</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <FormControl fullWidth size="small">
                <InputLabel>条数</InputLabel>
                <Select
                  value={pageSize}
                  label="条数"
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button 
                  variant="outlined" 
                  onClick={handleClearFilters}
                  size="small"
                >
                  清除
                </Button>
                <Typography variant="body2" color="text.secondary">
                  共 {total} 条
                </Typography>
                {loading && <CircularProgress size={16} />}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 行情表格 - 可滚动区域 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            maxHeight: 'calc(100vh - 200px)' // 为头部和分页留出空间
          }}
        >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { backgroundColor: '#f5f5f5', py: 1, height: 48 } }}>
              <TableCell sx={{ minWidth: 80 }}>股票代码</TableCell>
              <TableCell sx={{ minWidth: 100 }}>股票简称</TableCell>
              <TableCell 
                align="right" 
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  '&:hover': { backgroundColor: '#e8f4f8' },
                  minWidth: 80
                }}
                onClick={() => handleHeaderSort('close_price')}
              >
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  收盘价
                  {getSortIcon('close_price')}
                </Box>
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  '&:hover': { backgroundColor: '#e8f4f8' },
                  minWidth: 80
                }}
                onClick={() => handleHeaderSort('close_price')}
              >
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  涨跌额
                  {getSortIcon('close_price')}
                </Box>
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  '&:hover': { backgroundColor: '#e8f4f8' },
                  minWidth: 90
                }}
                onClick={() => handleHeaderSort('change_percent')}
              >
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  涨跌幅
                  {getSortIcon('change_percent')}
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ minWidth: 70 }}>最高价</TableCell>
              <TableCell align="right" sx={{ minWidth: 70 }}>最低价</TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  '&:hover': { backgroundColor: '#e8f4f8' },
                  minWidth: 90
                }}
                onClick={() => handleHeaderSort('volume')}
              >
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  成交量
                  {getSortIcon('volume')}
                </Box>
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  '&:hover': { backgroundColor: '#e8f4f8' },
                  minWidth: 90
                }}
                onClick={() => handleHeaderSort('amount')}
              >
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  成交额
                  {getSortIcon('amount')}
                </Box>
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  '&:hover': { backgroundColor: '#e8f4f8' },
                  minWidth: 80
                }}
                onClick={() => handleHeaderSort('turnover_rate')}
              >
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  换手率
                  {getSortIcon('turnover_rate')}
                </Box>
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  '&:hover': { backgroundColor: '#e8f4f8' },
                  minWidth: 70
                }}
                onClick={() => handleHeaderSort('pe_ratio')}
              >
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  市盈率
                  {getSortIcon('pe_ratio')}
                </Box>
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  '&:hover': { backgroundColor: '#e8f4f8' },
                  minWidth: 70
                }}
                onClick={() => handleHeaderSort('pb_ratio')}
              >
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  市净率
                  {getSortIcon('pb_ratio')}
                </Box>
              </TableCell>
              <TableCell sx={{ minWidth: 100 }}>行业</TableCell>
              <TableCell sx={{ minWidth: 80 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((stock) => (
              <TableRow key={`${stock.stockCode}-${stock.recordId}`} hover sx={{ '& .MuiTableCell-root': { py: 0.75 } }}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {stock.stockCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {stock.company?.stockSymbol || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={getPriceChangeColor(stock.priceChange)}
                  >
                    {formatNumber(stock.closingPrice)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2"
                    color={getPriceChangeColor(stock.priceChange)}
                  >
                    {(() => {
                      const priceChange = typeof stock.priceChange === 'string' 
                        ? parseFloat(stock.priceChange) 
                        : Number(stock.priceChange)
                      
                      if (isNaN(priceChange)) return '-'
                      return `${priceChange > 0 ? '+' : ''}${formatNumber(priceChange)}`
                    })()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                    {(() => {
                      const changePercent = typeof stock.priceChangePercentage === 'string' 
                        ? parseFloat(stock.priceChangePercentage) 
                        : Number(stock.priceChangePercentage)
                      
                      if (isNaN(changePercent)) {
                        return <ShowChart sx={{ fontSize: 16, color: '#666' }} />
                      } else if (changePercent > 0) {
                        return <TrendingUp sx={{ fontSize: 16, color: '#f44336' }} />
                      } else if (changePercent < 0) {
                        return <TrendingDown sx={{ fontSize: 16, color: '#4caf50' }} />
                      } else {
                        return <ShowChart sx={{ fontSize: 16, color: '#666' }} />
                      }
                    })()}
                    <Typography 
                      variant="body2"
                      fontWeight="bold"
                      color={getPriceChangeColor(stock.priceChangePercentage)}
                    >
                      {(() => {
                        const changePercent = typeof stock.priceChangePercentage === 'string' 
                          ? parseFloat(stock.priceChangePercentage) 
                          : Number(stock.priceChangePercentage)
                        
                        if (isNaN(changePercent)) return '-'
                        return `${changePercent > 0 ? '+' : ''}${formatNumber(changePercent)}%`
                      })()}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(stock.highestPrice)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(stock.lowestPrice)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(stock.tradingVolume, 0)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(stock.tradingAmount)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(stock.turnoverRate)}%
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(stock.peRatio)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(stock.pbRatio)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={stock.company?.industrySector || '-'} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Timeline />}
                    onClick={() => handleOpenKlineChart(stock)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    图表
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={14} align="center" sx={{ py: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    暂无数据
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>

      {/* 分页 */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          第 {page} 页，共 {totalPages} 页
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="small"
          showFirstButton
          showLastButton
        />
      </Stack>

      {/* 全屏K线图弹窗 */}
      {klineDialogOpen && selectedStock && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'white',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* K线图内容区域 - 直接全屏显示 */}
          <Box sx={{ flex: 1, height: '100vh' }}>
            <KLineChartContainer
              stockCode={selectedStock.stockCode}
              stockName={selectedStock.company?.stockSymbol}
              height={window.innerHeight}
              showControls={true}
              autoLoad={true}
              defaultTimeRange="6M"
              onClose={handleCloseKlineChart}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}