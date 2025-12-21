'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StockAnalysisLayout from '@/components/StockAnalysisLayout';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  ShowChart,
  Assessment,
  Timeline
} from '@mui/icons-material';
import { KLineChart, CHART_PRESETS } from '@/components/KLineChart';
import { fetchStockChartData, fetchStockInfo, fetchStockStats } from '@/apis/stockData';

// 类型定义
interface StockInfo {
  company: {
    stockCode: string;
    stockSymbol: string;
    companyArea: string;
    industrySector: string;
    marketType: string;
    stockExchange: string;
    listingDate: string;
  };
  latestPrice: {
    closingPrice: number;
    priceChange: number;
    priceChangePercentage: number;
    tradingVolume: bigint;
    tradingDate: string;
  } | null;
}

interface StockStats {
  period: string;
  dataPoints: number;
  priceRange: {
    max: number;
    min: number;
    avg: number;
  };
  priceChange: {
    absolute: number;
    percentage: number;
  };
  volume: {
    avg: number;
    total: number;
  };
  volatility: number;
}

const StockAnalysisPage: React.FC = () => {
  const params = useParams();
  const stockCode = params?.stockCode as string;

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [stockStats, setStockStats] = useState<StockStats | null>(null);
  const [chartPeriod, setChartPeriod] = useState('30d');

  // 数据获取
  useEffect(() => {
    if (!stockCode) return;

    const loadStockData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 并行获取股票信息和统计数据
        const [infoResponse, statsResponse] = await Promise.all([
          fetchStockInfo(stockCode),
          fetchStockStats(stockCode, chartPeriod)
        ]);

        if (infoResponse.success) {
          setStockInfo(infoResponse.data);
        } else {
          throw new Error(infoResponse.error || '获取股票信息失败');
        }

        if (statsResponse.success) {
          setStockStats(statsResponse.data);
        }
      } catch (err: any) {
        setError(err.message || '数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
  }, [stockCode, chartPeriod]);

  // 格式化函数
  const formatPrice = (price: number): string => {
    return `¥${price.toFixed(2)}`;
  };

  const formatVolume = (volume: bigint | number): string => {
    const num = typeof volume === 'bigint' ? Number(volume) : volume;
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(2)}亿`;
    }
    if (num >= 10000) {
      return `${(num / 10000).toFixed(2)}万`;
    }
    return num.toLocaleString();
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getPriceChangeColor = (change: number): string => {
    if (change > 0) return '#4caf50';
    if (change < 0) return '#f44336';
    return '#9e9e9e';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            加载股票数据中...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const latestPrice = stockInfo?.latestPrice;
  const company = stockInfo?.company;

  return (
    <StockAnalysisLayout 
      title={`${company?.stockSymbol || stockCode} 股票分析`}
    >
      <Container maxWidth="xl">
        {/* 面包屑导航 */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/stocks">
            股票列表
          </Link>
          <Typography color="text.primary">
            {company?.stockSymbol || stockCode} 股票分析
          </Typography>
        </Breadcrumbs>

      {/* 股票基本信息 */}
      {company && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {company.stockSymbol}
                </Typography>
                <Chip 
                  label={company.stockCode} 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={company.stockExchange} 
                  color="secondary"
                  size="small"
                />
              </Box>
              
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    公司领域
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {company.companyArea || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    行业板块
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {company.industrySector || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    上市日期
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(company.listingDate)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* 最新价格信息 */}
            {latestPrice && (
              <Grid item xs={12} md={4}>
                <Box textAlign="right">
                  <Typography variant="h3" component="div" fontWeight="bold">
                    {formatPrice(latestPrice.closingPrice)}
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                    {latestPrice.priceChange >= 0 ? 
                      <TrendingUp sx={{ color: getPriceChangeColor(latestPrice.priceChange) }} /> :
                      <TrendingDown sx={{ color: getPriceChangeColor(latestPrice.priceChange) }} />
                    }
                    <Typography 
                      variant="h6" 
                      sx={{ color: getPriceChangeColor(latestPrice.priceChange) }}
                    >
                      {latestPrice.priceChange > 0 ? '+' : ''}
                      {formatPrice(latestPrice.priceChange)}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ color: getPriceChangeColor(latestPrice.priceChange) }}
                    >
                      ({latestPrice.priceChangePercentage > 0 ? '+' : ''}
                      {latestPrice.priceChangePercentage.toFixed(2)}%)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(latestPrice.tradingDate)} 收盘
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* K线图表区域 */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                <ShowChart />
                K线图分析
              </Typography>
              
              {/* 时间周期选择器 */}
              <Box display="flex" gap={1}>
                {[
                  { value: '7d', label: '7天' },
                  { value: '30d', label: '30天' },
                  { value: '90d', label: '90天' },
                  { value: '1y', label: '1年' }
                ].map((period) => (
                  <Chip
                    key={period.value}
                    label={period.label}
                    onClick={() => setChartPeriod(period.value)}
                    color={chartPeriod === period.value ? 'primary' : 'default'}
                    variant={chartPeriod === period.value ? 'filled' : 'outlined'}
                    size="small"
                    clickable
                  />
                ))}
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* K线图组件 */}
            <Box sx={{ height: 500 }}>
              <KLineChart
                stockCode={stockCode}
                symbol={`${company?.stockSymbol || stockCode} (${stockCode})`}
                config={{
                  ...CHART_PRESETS.default,
                  width: '100%',
                  height: 500,
                }}
                showVolume={true}
                onCrosshairMove={(data) => {
                  // 可以在这里处理十字线移动事件
                  console.log('十字线数据:', data);
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* 右侧统计信息 */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* 价格统计 */}
            {stockStats && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                      <Assessment />
                      价格统计 ({stockStats.period})
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          最高价
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {formatPrice(stockStats.priceRange.max)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          最低价
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {formatPrice(stockStats.priceRange.min)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          平均价
                        </Typography>
                        <Typography variant="h6">
                          {formatPrice(stockStats.priceRange.avg)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          波动率
                        </Typography>
                        <Typography variant="h6">
                          {stockStats.volatility.toFixed(2)}%
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        区间涨跌
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {stockStats.priceChange.absolute >= 0 ? 
                          <TrendingUp sx={{ color: 'success.main' }} /> :
                          <TrendingDown sx={{ color: 'error.main' }} />
                        }
                        <Typography 
                          variant="h6"
                          sx={{ 
                            color: stockStats.priceChange.absolute >= 0 ? 'success.main' : 'error.main'
                          }}
                        >
                          {stockStats.priceChange.absolute > 0 ? '+' : ''}
                          {formatPrice(stockStats.priceChange.absolute)}
                        </Typography>
                        <Typography 
                          variant="h6"
                          sx={{ 
                            color: stockStats.priceChange.absolute >= 0 ? 'success.main' : 'error.main'
                          }}
                        >
                          ({stockStats.priceChange.percentage > 0 ? '+' : ''}
                          {stockStats.priceChange.percentage.toFixed(2)}%)
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* 成交量统计 */}
            {stockStats && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                      <Timeline />
                      成交量统计
                    </Typography>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        平均成交量
                      </Typography>
                      <Typography variant="h6">
                        {formatVolume(stockStats.volume.avg)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        总成交量
                      </Typography>
                      <Typography variant="h6">
                        {formatVolume(stockStats.volume.total)}
                      </Typography>
                    </Box>

                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        数据点数
                      </Typography>
                      <Typography variant="body1">
                        {stockStats.dataPoints} 个交易日
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* 技术指标占位 */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    技术指标
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    敬请期待更多技术指标分析...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
    </StockAnalysisLayout>
  );
};

export default StockAnalysisPage;