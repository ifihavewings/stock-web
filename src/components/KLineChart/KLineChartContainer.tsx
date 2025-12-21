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
  defaultTimeRange?: '1M' | '3M' | '6M' | '1Y' | 'ALL';
  onClose?: () => void;
}

// 时间范围配置
const TIME_RANGES = {
  '1M': { label: '1个月', days: 30 },
  '3M': { label: '3个月', days: 90 },
  '6M': { label: '6个月', days: 180 },
  '1Y': { label: '1年', days: 365 },
  'ALL': { label: '全部', days: null }
};

export const KLineChartContainer: React.FC<KLineChartContainerProps> = ({
  stockCode,
  stockName = '',
  height = 600,
  autoLoad = true,
  showControls = true,
  defaultTimeRange = '6M',
  onClose
}) => {
  // 状态管理
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(false);
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

      setChartData(result.candlestickData);
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