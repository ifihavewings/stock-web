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
  onClose,
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
  const [hoveredData, setHoveredData] = useState<CandlestickData | null>(null);

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
      width: 800,  // 初始宽度，ResizeObserver会调整
      height: 600, // 初始高度，ResizeObserver会调整
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
          width: 1 as const,
          color: theme.crosshairColor,
          style: 0,
        },
        horzLine: {
          width: 1 as const,
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
        rightOffset: 12,  // 右侧留白空间
        barSpacing: 6,    // K线间距
        minBarSpacing: 2,
      },
      localization: {
        locale: mergedConfig.locale,
        timeFormatter: (time: string | number) => {
          // time 可能是字符串 "2024-01-01" 或 Unix 时间戳
          if (typeof time === 'string') {
            return new Date(time).toLocaleDateString('zh-CN');
          }
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
    };
  }, [theme]);

  // 初始化图表
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current || chartRef.current) {
      return;
    }

    try {
      // 获取容器实际尺寸
      const containerWidth = chartContainerRef.current.clientWidth;
      const containerHeight = chartContainerRef.current.clientHeight;
      
      // 使用容器实际尺寸创建图表
      const actualOptions = {
        ...chartOptions,
        width: containerWidth || 800,
        height: containerHeight || 600,
      };
      
      // 创建图表
      const chart = createChart(chartContainerRef.current, actualOptions);
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
        if (param.time && candlestickSeriesRef.current) {
          // 从原始数据中查找完整的数据，包含额外字段
          let timeStr: string;
          if (typeof param.time === 'string') {
            timeStr = param.time;
          } else if (typeof param.time === 'number') {
            timeStr = new Date(param.time * 1000).toISOString().split('T')[0];
          } else {
            // Handle BusinessDay type { year, month, day }
            const bd = param.time as { year: number; month: number; day: number };
            timeStr = `${bd.year}-${String(bd.month).padStart(2, '0')}-${String(bd.day).padStart(2, '0')}`;
          }
          const fullData = chartData.find(item => item.time === timeStr);
          
          if (fullData) {
            setHoveredData(fullData);
          } else {
            // 如果找不到完整数据，使用图表返回的基础数据
            const data = param.seriesData.get(candlestickSeriesRef.current) as any;
            if (data) {
              setHoveredData(data as CandlestickData);
            }
          }
        } else {
          setHoveredData(null);
        }
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

      // 自动适应图表可见范围
      if (chartRef.current && data.length > 0) {
        // 显示最近250条K线（约1年），既能看清细节又能看到趋势
        setTimeout(() => {
          if (chartRef.current) {
            const visibleCount = Math.min(250, data.length);
            if (data.length > 50) {
              chartRef.current.timeScale().setVisibleLogicalRange({
                from: Math.max(0, data.length - visibleCount),
                to: data.length - 1
              });
            } else {
              // 数据较少时使用fitContent
              chartRef.current.timeScale().fitContent();
            }
          }
        }, 100);
      }

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
      lineWidth: indicator.lineWidth as 1 | 2 | 3 | 4,
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

  // 响应式监听 - 使用ResizeObserver
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (chartRef.current) {
          const { width, height } = entry.contentRect;
          chartRef.current.applyOptions({
            width: width,
            height: height,
          });
        }
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
      style={{ ...style, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* 图表标题 */}
      {(stockCode || stockName) && (
        <div 
          className="chart-header"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
              {stockName} ({stockCode})
            </h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
              K线图分析
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              关闭
            </button>
          )}
        </div>
      )}
      
      {/* 图表容器 */}
      <div 
        ref={chartContainerRef}
        className="chart-wrapper"
        style={{ 
          width: '100%', 
          flex: 1,
          position: 'relative',
          minHeight: 0  // 允许flex子元素收缩
        }}
      >
        {/* 悬停信息框 */}
        {hoveredData && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '11px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              zIndex: 1000,
              minWidth: '160px',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '5px', color: '#333', fontSize: '12px' }}>
              {typeof hoveredData.time === 'string' 
                ? new Date(hoveredData.time).toLocaleDateString('zh-CN')
                : new Date(hoveredData.time * 1000).toLocaleDateString('zh-CN')
              }
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: '3px 6px', color: '#666', lineHeight: '1.4' }}>
              <span>开盘:</span>
              <span style={{ fontWeight: 500, color: '#333' }}>{hoveredData.open.toFixed(2)}</span>
              
              <span>收盘:</span>
              <span style={{ 
                fontWeight: 500, 
                color: hoveredData.close >= hoveredData.open ? theme.upColor : theme.downColor 
              }}>
                {hoveredData.close.toFixed(2)}
              </span>
              
              <span>最高:</span>
              <span style={{ fontWeight: 500, color: '#333' }}>{hoveredData.high.toFixed(2)}</span>
              
              <span>最低:</span>
              <span style={{ fontWeight: 500, color: '#333' }}>{hoveredData.low.toFixed(2)}</span>
              
              <span>振幅:</span>
              <span style={{ fontWeight: 500, color: '#333' }}>
                {(((hoveredData.high - hoveredData.low) / hoveredData.low) * 100).toFixed(2)}%
              </span>
              
              {(hoveredData as any).volume && (
                <>
                  <span>成交量:</span>
                  <span style={{ fontWeight: 500, color: '#333' }}>
                    {((hoveredData as any).volume / 10000).toFixed(0)}万
                  </span>
                </>
              )}
              
              {(hoveredData as any).tradingAmount && (
                <>
                  <span>成交额:</span>
                  <span style={{ fontWeight: 500, color: '#333' }}>
                    {((hoveredData as any).tradingAmount / 100000000).toFixed(2)}亿
                  </span>
                </>
              )}
              
              <span>涨跌:</span>
              <span style={{ 
                fontWeight: 500, 
                color: hoveredData.close - hoveredData.open >= 0 ? theme.upColor : theme.downColor 
              }}>
                {hoveredData.close - hoveredData.open >= 0 ? '+' : ''}
                {(hoveredData.close - hoveredData.open).toFixed(2)}
              </span>
              
              <span>涨幅:</span>
              <span style={{ 
                fontWeight: 500, 
                color: hoveredData.close - hoveredData.open >= 0 ? theme.upColor : theme.downColor 
              }}>
                {hoveredData.close - hoveredData.open >= 0 ? '+' : ''}
                {(((hoveredData.close - hoveredData.open) / hoveredData.open) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 导出默认组件
export default AdvancedKLineChart;