'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  CandlestickSeriesPartialOptions,
  HistogramSeriesPartialOptions,
  LineSeriesPartialOptions,
  CrosshairMode,
  PriceScaleMode,
  ColorType
} from 'lightweight-charts';

import { 
  KLineChartProps, 
  CandlestickData, 
  VolumeData, 
  KLineChartConfig, 
  ChartTheme, 
  CHART_THEMES,
  TechnicalIndicator,
  IndicatorData
} from './types';
import { TechnicalIndicators } from './indicators';
import { DataTransformer } from './types';

// 默认配置
const DEFAULT_CONFIG: Required<KLineChartConfig> = {
  width: 800,
  height: 600,
  theme: 'light',
  showVolume: true,
  volumeHeight: 30,
  showCrosshair: true,
  showTimeScale: true,
  showPriceScale: true,
  indicators: [],
  autoScale: true,
  rightOffset: 20,
  timezone: 'Asia/Shanghai',
  locale: 'zh-CN',
  candlestickOptions: {},
  chartOptions: {}
};

export const AdvancedKLineChart: React.FC<KLineChartProps> = ({
  stockCode,
  stockName = '',
  initialData = [],
  config = {},
  onCrosshairMove,
  onVisibleRangeChange,
  onDataUpdate,
  onError,
  className = '',
  style = {},
  loading = false,
  height = 600,
  enableRealtime = false,
  realTimeInterval = 5000
}) => {
  // Refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<any>>>(new Map());

  // State
  const [chartData, setChartData] = useState<CandlestickData[]>(initialData);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 合并配置
  const mergedConfig = useMemo((): Required<KLineChartConfig> => {
    return { ...DEFAULT_CONFIG, ...config };
  }, [config]);

  // 获取主题配置
  const theme = useMemo((): ChartTheme => {
    if (typeof mergedConfig.theme === 'string') {
      return CHART_THEMES[mergedConfig.theme] || CHART_THEMES.light;
    }
    return mergedConfig.theme;
  }, [mergedConfig.theme]);

  // 创建图表配置
  const chartOptions = useMemo(() => {
    const baseOptions = {
      width: chartContainerRef.current?.clientWidth || mergedConfig.width,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: theme.background },
        textColor: theme.textColor,
      },
      grid: {
        vertLines: { color: theme.gridColor },
        horzLines: { color: theme.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: theme.crosshairColor,
          style: 0,
        },
        horzLine: {
          width: 1,
          color: theme.crosshairColor,
          style: 0,
        },
      },
      rightPriceScale: {
        borderColor: theme.borderColor,
        scaleMargins: {
          top: 0.1,
          bottom: mergedConfig.showVolume ? 0.4 : 0.1,
        },
        mode: PriceScaleMode.Normal,
        autoScale: mergedConfig.autoScale,
      },
      timeScale: {
        borderColor: theme.borderColor,
        timeVisible: mergedConfig.showTimeScale,
        rightOffset: mergedConfig.rightOffset,
        barSpacing: 6,
        minBarSpacing: 3,
      },
      localization: {
        locale: mergedConfig.locale,
        timeFormatter: (time: number) => {
          return new Date(time * 1000).toLocaleDateString('zh-CN');
        },
      },
    };

    return { ...baseOptions, ...mergedConfig.chartOptions };
  }, [mergedConfig, theme, height]);

  // K线系列配置
  const candlestickOptions = useMemo((): CandlestickSeriesPartialOptions => {
    return {
      upColor: mergedConfig.candlestickOptions.upColor || theme.upColor,
      downColor: mergedConfig.candlestickOptions.downColor || theme.downColor,
      wickUpColor: mergedConfig.candlestickOptions.wickUpColor || theme.upColor,
      wickDownColor: mergedConfig.candlestickOptions.wickDownColor || theme.downColor,
      borderUpColor: mergedConfig.candlestickOptions.borderUpColor || theme.upColor,
      borderDownColor: mergedConfig.candlestickOptions.borderDownColor || theme.downColor,
    };
  }, [mergedConfig.candlestickOptions, theme]);

  // 成交量系列配置
  const volumeOptions = useMemo((): HistogramSeriesPartialOptions => {
    return {
      color: theme.volumeUpColor,
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    };
  }, [theme]);

  // 初始化图表
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current || chartRef.current) {
      return;
    }

    try {
      // 创建图表
      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      // 创建K线系列
      const candlestickSeries = chart.addCandlestickSeries(candlestickOptions);
      candlestickSeriesRef.current = candlestickSeries;

      // 创建成交量系列
      if (mergedConfig.showVolume) {
        const volumeSeries = chart.addHistogramSeries({
          ...volumeOptions,
          priceScaleId: 'volume',
        });
        volumeSeriesRef.current = volumeSeries;
        
        // 创建成交量价格刻度
        chart.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.7,
            bottom: 0,
          },
        });
      }

      // 设置事件监听器
      chart.subscribeCrosshairMove((param) => {
        onCrosshairMove?.(param);
      });

      // v4 API: 使用 subscribeVisibleLogicalRangeChange
      if (onVisibleRangeChange) {
        chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
          onVisibleRangeChange?.(range);
        });
      }

      setIsInitialized(true);
    } catch (err) {
      const error = err as Error;
      setError(`图表初始化失败: ${error.message}`);
      onError?.(error);
    }
  }, [chartOptions, candlestickOptions, volumeOptions, mergedConfig.showVolume, onCrosshairMove, onVisibleRangeChange, onError]);

  // 清理图表
  const cleanupChart = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    
    candlestickSeriesRef.current = null;
    volumeSeriesRef.current = null;
    indicatorSeriesRef.current.clear();
    setIsInitialized(false);
  }, []);

  // 更新图表数据
  const updateChartData = useCallback((data: CandlestickData[]) => {
    if (!candlestickSeriesRef.current || data.length === 0) return;

    try {
      // 更新K线数据
      candlestickSeriesRef.current.setData(data);
      
      // 更新成交量数据
      if (volumeSeriesRef.current && mergedConfig.showVolume) {
        const volumeData: VolumeData[] = data.map(item => ({
          time: item.time,
          value: (item as any).volume || 0,
          color: item.close >= item.open ? theme.volumeUpColor : theme.volumeDownColor,
        }));
        
        volumeSeriesRef.current.setData(volumeData);
      }

      // 更新技术指标
      updateIndicators(data);

      setChartData(data);
      onDataUpdate?.(data);
    } catch (err) {
      const error = err as Error;
      setError(`数据更新失败: ${error.message}`);
      onError?.(error);
    }
  }, [mergedConfig.showVolume, theme, onDataUpdate, onError]);

  // 更新技术指标
  const updateIndicators = useCallback((data: CandlestickData[]) => {
    if (!chartRef.current || !mergedConfig.indicators?.length) return;

    // 清理旧的指标系列
    indicatorSeriesRef.current.forEach((series) => {
      chartRef.current!.removeSeries(series);
    });
    indicatorSeriesRef.current.clear();

    // 计算并添加新的指标
    mergedConfig.indicators.forEach((indicator) => {
      if (!indicator.enabled || !indicator.visible) return;

      try {
        const result = TechnicalIndicators.calculateIndicator(data, indicator);
        
        if (Array.isArray(result)) {
          // 单线指标 (如 SMA, EMA, RSI)
          addIndicatorSeries(indicator, result);
        } else if (typeof result === 'object') {
          // 多线指标 (如 MACD, KDJ, Bollinger Bands)
          Object.entries(result).forEach(([key, seriesData], index) => {
            const seriesConfig = { 
              ...indicator, 
              id: `${indicator.id}_${key}`,
              color: getIndicatorColor(indicator.color, index)
            };
            addIndicatorSeries(seriesConfig, seriesData);
          });
        }
      } catch (err) {
        console.error(`Error updating indicator ${indicator.id}:`, err);
      }
    });
  }, [mergedConfig.indicators]);

  // 添加指标系列
  const addIndicatorSeries = useCallback((indicator: TechnicalIndicator, data: IndicatorData[]) => {
    if (!chartRef.current || data.length === 0) return;

    const seriesOptions: LineSeriesPartialOptions = {
      color: indicator.color,
      lineWidth: indicator.lineWidth,
      title: indicator.name,
      priceScaleId: indicator.type === 'oscillator' ? `oscillator_${indicator.id}` : 'right',
    };

    // 震荡指标使用独立的价格刻度
    if (indicator.type === 'oscillator') {
      chartRef.current.priceScale(`oscillator_${indicator.id}`).applyOptions({
        scaleMargins: { top: 0.1, bottom: 0.1 },
      });
    }

    const series = chartRef.current.addLineSeries(seriesOptions);
    series.setData(data);
    
    indicatorSeriesRef.current.set(indicator.id, series);
  }, []);

  // 获取指标颜色变体
  const getIndicatorColor = (baseColor: string, index: number): string => {
    const colors = [baseColor, '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
    return colors[index % colors.length];
  };

  // 响应式调整
  const handleResize = useCallback(() => {
    if (chartRef.current && chartContainerRef.current) {
      const { clientWidth, clientHeight } = chartContainerRef.current;
      chartRef.current.applyOptions({
        width: clientWidth,
        height: clientHeight,
      });
    }
  }, []);

  // 初始化和清理
  useEffect(() => {
    const timer = setTimeout(initializeChart, 100);
    return () => {
      clearTimeout(timer);
      cleanupChart();
    };
  }, [initializeChart, cleanupChart]);

  // 数据更新
  useEffect(() => {
    if (isInitialized && chartData.length > 0) {
      updateChartData(chartData);
    }
  }, [isInitialized, chartData, updateChartData]);

  // 初始数据设置
  useEffect(() => {
    if (initialData.length > 0) {
      setChartData(initialData);
    }
  }, [initialData]);

  // 响应式监听
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // 实时数据（如果启用）
  useEffect(() => {
    if (!enableRealtime) return;

    const interval = setInterval(async () => {
      try {
        // 这里应该调用实时数据API
        // 示例：const newData = await fetchRealtimeData(stockCode);
        // updateChartData(newData);
        console.log('Fetching real-time data for:', stockCode);
      } catch (err) {
        console.error('Real-time data fetch failed:', err);
      }
    }, realTimeInterval);

    return () => clearInterval(interval);
  }, [enableRealtime, stockCode, realTimeInterval]);

  // 错误显示
  if (error) {
    return (
      <div 
        className={`kline-chart-error ${className}`}
        style={{ 
          ...style, 
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
          color: theme.textColor,
          border: `1px solid ${theme.borderColor}`
        }}
      >
        <div>
          <h4>图表加载失败</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // 加载状态
  if (loading) {
    return (
      <div 
        className={`kline-chart-loading ${className}`}
        style={{ 
          ...style, 
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
          color: theme.textColor
        }}
      >
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div 
      className={`kline-chart-container ${className}`}
      style={style}
    >
      {/* 图表标题 */}
      {(stockCode || stockName) && (
        <div 
          className="chart-header"
          style={{
            padding: '10px',
            backgroundColor: theme.background,
            color: theme.textColor,
            borderBottom: `1px solid ${theme.borderColor}`
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            {stockName} ({stockCode})
          </h3>
        </div>
      )}
      
      {/* 图表容器 */}
      <div 
        ref={chartContainerRef}
        className="chart-wrapper"
        style={{ 
          width: '100%', 
          height: (stockCode || stockName) ? height - 50 : height,
          position: 'relative'
        }}
      />
    </div>
  );
};

// 导出默认组件
export default AdvancedKLineChart;