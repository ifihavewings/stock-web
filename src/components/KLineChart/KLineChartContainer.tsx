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
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
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

  // 加载数据（一次性加载15年全部历史数据）
  const loadData = useCallback(async (showLoading = true) => {
    if (!stockCode) return;

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      // 计算15年前的日期
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 15);
      
      const result = await klineDataService.getAdvancedKLineData({
        stockCodeLike: stockCode,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        pageSize: 100000, // 足够大的数量，确保获取该股票所有历史数据
        sortField: 'tradingDate', // 按交易日期字段排序
        sortDirection: 'ASC' // 升序排列，从最早到最新
      });

      console.log(`📊 加载K线数据: ${result.candlestickData.length}条`);
      console.log(`📅 数据时间范围: ${result.candlestickData[0]?.time} 至 ${result.candlestickData[result.candlestickData.length - 1]?.time}`);

      if (result.candlestickData.length === 0) {
        throw new Error('未找到数据，请检查股票代码');
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
  }, [stockCode, currentPeriod]);

  // 自动加载数据
  useEffect(() => {
    if (autoLoad && stockCode) {
      loadData();
    }
  }, [autoLoad, stockCode, loadData]);

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
    link.setAttribute('download', `${stockCode}_kline_all.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [chartData, stockCode]);

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

          {!error && (
            <AdvancedKLineChart
              stockCode={stockCode}
              stockName={stockName}
              initialData={chartData}
              config={chartConfig}
              loading={loading}
              onError={(err) => setError(err.message)}
              onClose={onClose}
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