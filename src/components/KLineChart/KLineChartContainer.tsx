'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Stack, 
  Alert,
  Snackbar,
  CircularProgress,
  Fab,
  Backdrop,
  Toolbar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Settings,
  Refresh,
  Download,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  Timeline,
  Close
} from '@mui/icons-material';

import { AdvancedKLineChart } from './KLineChartWrapper';
import { IndicatorConfigPanel } from './IndicatorConfigPanel';
import { klineDataService } from './dataService';
import { KLinePeriodConverter, KLinePeriod } from './periodConverter';
import { 
  KLineChartConfig, 
  CandlestickData, 
  TechnicalIndicator,
  CHART_THEMES
} from './types';
import { INDICATOR_TEMPLATES } from './indicators';

interface KLineChartContainerProps {
  stockCode: string;
  stockName?: string;
  height?: number;
  autoLoad?: boolean;
  showControls?: boolean;
  defaultTimeRange?: '1M' | '3M' | '6M' | '1Y' | '2Y' | 'ALL';
  onClose?: () => void;
}

// 时间范围配置
const TIME_RANGES = {
  '1M': { label: '1个月', days: 30 },
  '3M': { label: '3个月', days: 90 },
  '6M': { label: '6个月', days: 180 },
  '1Y': { label: '1年', days: 365 },
  '2Y': { label: '2年', days: 730 },
  'ALL': { label: '全部', days: null }
};

export const KLineChartContainer: React.FC<KLineChartContainerProps> = ({
  stockCode,
  stockName = '',
  height = 600,
  autoLoad = true,
  showControls = true,
  defaultTimeRange = '2Y',
  onClose
}) => {
  // 状态管理
  const [rawDailyData, setRawDailyData] = useState<CandlestickData[]>([]); // 原始日K数据
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<KLinePeriod>('day'); // 当前周期
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // 加载更多数据的状态
  const [isLoadingMoreRef] = useState({ current: false }); // 防止重复加载
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(defaultTimeRange);
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // 图表配置
  const [chartConfig, setChartConfig] = useState<KLineChartConfig>({
    theme: 'light',
    showVolume: true,
    volumeHeight: 30,
    showCrosshair: true,
    showTimeScale: true,
    showPriceScale: true,
    autoScale: true,
    rightOffset: 20,
    indicators: [
      // 默认启用一些基础指标
      { ...INDICATOR_TEMPLATES.sma20, enabled: true, visible: true },
      { ...INDICATOR_TEMPLATES.ema12, enabled: false, visible: false },
      { ...INDICATOR_TEMPLATES.rsi14, enabled: false, visible: false },
    ]
  });

  // 计算日期范围
  const getDateRange = useCallback((timeRange: string) => {
    const now = new Date();
    const rangeConfig = TIME_RANGES[timeRange as keyof typeof TIME_RANGES];
    
    if (!rangeConfig.days) {
      return { startDate: undefined, endDate: undefined };
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - rangeConfig.days);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }, []);

  // 加载数据
  const loadData = useCallback(async (showLoading = true) => {
    if (!stockCode) return;

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(selectedTimeRange);
      
      const result = await klineDataService.getAdvancedKLineData({
        stockCodeLike: stockCode,
        startDate: startDate,
        endDate: endDate,
        pageSize: 1000
      });

      if (result.candlestickData.length === 0) {
        throw new Error('未找到数据，请检查股票代码或时间范围');
      }

      // 保存原始日K数据
      setRawDailyData(result.candlestickData);
      // 根据当前周期转换数据
      const convertedData = KLinePeriodConverter.convertByPeriod(result.candlestickData, currentPeriod);
      setChartData(convertedData);
      setStockInfo(result.stockInfo);
      setLastUpdateTime(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '数据加载失败';
      setError(errorMessage);
      console.error('K线数据加载失败:', err);
    } finally {
      setLoading(false);
    }
  }, [stockCode, selectedTimeRange, getDateRange]);

  // 加载更多历史数据（向前100条）
  const loadMoreData = useCallback(async () => {
    if (!stockCode || rawDailyData.length === 0 || isLoadingMoreRef.current || loadingMore) {
      return;
    }

    // 获取当前最早的数据日期
    const earliestDate = rawDailyData[0]?.time;
    if (!earliestDate) return;

    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      // 计算请求的日期范围（向前推100个交易日，实际可能需要更长时间跨度）
      const endDate = new Date(earliestDate);
      endDate.setDate(endDate.getDate() - 1); // 前一天
      const startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 1); // 向前推1年确保有足够数据

      const result = await klineDataService.getAdvancedKLineData({
        stockCodeLike: stockCode,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        pageSize: 100, // 只请求100条
        sortField: 'trade_date',
        sortDirection: 'DESC'
      });

      if (result.candlestickData.length > 0) {
        // 过滤掉已存在的数据（防止重复）
        const existingDates = new Set(rawDailyData.map(d => d.time));
        const newData = result.candlestickData.filter(d => !existingDates.has(d.time));
        
        if (newData.length === 0) {
          console.log('没有更多历史数据');
          return;
        }
        
        // 合并数据并按时间升序排序
        const updatedDailyData = [...newData, ...rawDailyData].sort((a, b) => {
          return new Date(a.time).getTime() - new Date(b.time).getTime();
        });
        
        setRawDailyData(updatedDailyData);
        
        // 根据当前周期转换数据
        const convertedData = KLinePeriodConverter.convertByPeriod(updatedDailyData, currentPeriod);
        setChartData(convertedData);

        console.log(`加载了 ${newData.length} 条历史数据，最早日期: ${updatedDailyData[0]?.time}`);
      }
    } catch (err) {
      console.error('加载更多数据失败:', err);
    } finally {
      setLoadingMore(false);
      // 延迟重置标志，避免频繁加载
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 1000);
    }
  }, [stockCode, rawDailyData, currentPeriod, loadingMore]);

  // 处理可见范围变化，检测是否需要加载更多数据
  const handleVisibleRangeChange = useCallback((range: any) => {
    if (!range || typeof range.from !== 'number') return;
    
    // 当滚动到接近最左边时（前10条数据可见），加载更多
    if (range.from < 10) {
      loadMoreData();
    }
  }, [loadMoreData]);

  // 自动加载数据
  useEffect(() => {
    if (autoLoad && stockCode) {
      loadData();
    }
  }, [autoLoad, stockCode, loadData]);

  // 时间范围变化时重新加载
  useEffect(() => {
    if (stockCode && chartData.length > 0) {
      loadData(false);
    }
  }, [selectedTimeRange]);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // 导出数据
  const exportData = useCallback(() => {
    if (chartData.length === 0) return;

    const csvContent = [
      ['日期', '开盘价', '最高价', '最低价', '收盘价', '成交量'].join(','),
      ...chartData.map(item => [
        item.time,
        item.open,
        item.high,
        item.low,
        item.close,
        (item as any).volume || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${stockCode}_kline_${selectedTimeRange}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [chartData, stockCode, selectedTimeRange]);

  // 显示的股票标题
  const displayTitle = useMemo(() => {
    if (stockName && stockInfo?.stock_name) {
      return `${stockInfo.stock_name} (${stockCode})`;
    }
    if (stockName) {
      return `${stockName} (${stockCode})`;
    }
    if (stockInfo?.stock_name) {
      return `${stockInfo.stock_name} (${stockCode})`;
    }
    return stockCode;
  }, [stockCode, stockName, stockInfo]);

  // 当前主题
  const currentTheme = useMemo(() => {
    const themeKey = typeof chartConfig.theme === 'string' ? chartConfig.theme : 'light';
    return CHART_THEMES[themeKey] || CHART_THEMES.light;
  }, [chartConfig.theme]);

  // 活跃指标数量
  const activeIndicatorCount = useMemo(() => {
    return (chartConfig.indicators || []).filter(ind => ind.enabled && ind.visible).length;
  }, [chartConfig.indicators]);

  return (
    <>
      <Paper 
        elevation={2}
        sx={{
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : '100%',
          zIndex: isFullscreen ? 1300 : 'auto',
          backgroundColor: currentTheme.background,
          color: currentTheme.textColor,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 工具栏 */}
        {showControls && (
          <Toolbar 
            variant="dense"
            sx={{ 
              borderBottom: `1px solid ${currentTheme.borderColor}`,
              justifyContent: 'space-between',
              minHeight: 48
            }}
>
            {/* 左侧信息 */}
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {displayTitle}
              </Typography>
              
              {/* K线周期切换 */}
              <Stack direction="row" spacing={0.5}>
                {(['day', 'week', 'month'] as KLinePeriod[]).map((period) => (
                  <Button
                    key={period}
                    size="small"
                    variant={currentPeriod === period ? 'contained' : 'outlined'}
                    onClick={() => {
                      setCurrentPeriod(period);
                      const convertedData = KLinePeriodConverter.convertByPeriod(rawDailyData, period);
                      setChartData(convertedData);
                    }}
                    sx={{ 
                      minWidth: '48px',
                      height: '28px',
                      fontSize: '12px',
                      px: 1
                    }}
                  >
                    {KLinePeriodConverter.getPeriodLabel(period)}
                  </Button>
                ))}
              </Stack>
              
              {lastUpdateTime && (
                <Typography variant="caption" color="text.secondary">
                  {lastUpdateTime.toLocaleTimeString()}
                </Typography>
              )}

              {activeIndicatorCount > 0 && (
                <Chip 
                  icon={<Timeline />}
                  label={`${activeIndicatorCount}个指标`} 
                  size="small" 
                  color="primary"
                />
              )}
            </Box>

            {/* 右侧控制 */}
            <Stack direction="row" spacing={1} alignItems="center">
              {/* 时间范围选择 */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>时间范围</InputLabel>
                <Select
                  value={selectedTimeRange}
                  label="时间范围"
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  disabled={loading}
                >
                  {Object.entries(TIME_RANGES).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      {config.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 操作按钮 */}
              <Tooltip title="刷新数据">
                <IconButton 
                  onClick={() => loadData()} 
                  disabled={loading}
                  size="small"
                >
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Tooltip title="导出数据">
                <IconButton 
                  onClick={exportData} 
                  disabled={loading || chartData.length === 0}
                  size="small"
                >
                  <Download />
                </IconButton>
              </Tooltip>

              <Tooltip title="指标设置">
                <IconButton 
                  onClick={() => setConfigPanelOpen(true)}
                  color={configPanelOpen ? 'primary' : 'default'}
                  size="small"
                >
                  <Settings />
                </IconButton>
              </Tooltip>

              <Tooltip title={isFullscreen ? '退出全屏' : '全屏显示'}>
                <IconButton 
                  onClick={toggleFullscreen}
                  size="small"
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>

              {onClose && (
                <Tooltip title="关闭">
                  <IconButton 
                    onClick={onClose}
                    size="small"
                    color="error"
                  >
                    <Close />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Toolbar>
        )}

        {/* 图表内容 */}
        <Box sx={{ 
          position: 'relative', 
          flex: 1, 
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ m: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => loadData()}>
                  重试
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {loading && (
            <Backdrop open={true} sx={{ zIndex: 1, position: 'absolute' }}>
              <CircularProgress />
            </Backdrop>
          )}

          {/* 加载更多历史数据提示 */}
          {loadingMore && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CircularProgress size={16} sx={{ color: 'white' }} />
              <Typography variant="caption">正在加载更多历史数据...</Typography>
            </Box>
          )}

          {!error && (
            <AdvancedKLineChart
              stockCode={stockCode}
              stockName={stockName}
              initialData={chartData}
              config={chartConfig}
              loading={loading}
              onError={(err) => setError(err.message)}
              onClose={onClose}
              onVisibleRangeChange={handleVisibleRangeChange}
            />
          )}
        </Box>

        {/* 配置面板 */}
        <IndicatorConfigPanel
          open={configPanelOpen}
          onClose={() => setConfigPanelOpen(false)}
          config={chartConfig}
          onConfigChange={setChartConfig}
        />
      </Paper>

      {/* 错误提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

// 简化的使用组件
export const SimpleKLineChart: React.FC<{
  stockCode: string;
  height?: number;
}> = ({ stockCode, height = 400 }) => {
  return (
    <KLineChartContainer
      stockCode={stockCode}
      height={height}
      showControls={false}
      autoLoad={true}
      defaultTimeRange="3M"
    />
  );
};

export default KLineChartContainer;