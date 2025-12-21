'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StockData {
  tradeDate: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
}

interface KLineChartProps {
  stockCode: string;
  height?: number;
}

const KLineChartFixed: React.FC<KLineChartProps> = ({ 
  stockCode, 
  height = 600
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:1688/stock-data-fetcher/chart/${stockCode}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
          throw new Error('没有找到股票数据');
        }

        setStockData(data);
      } catch (err) {
        console.error('获取股票数据失败:', err);
        setError(err instanceof Error ? err.message : '数据获取失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (stockCode) {
      fetchData();
    }
  }, [stockCode]);

  useEffect(() => {
    let mounted = true;

    const initChart = async () => {
      if (!chartContainerRef.current || stockData.length === 0 || !mounted) return;

      try {
        // 清理之前的图表实例
        if (chartInstanceRef.current) {
          chartInstanceRef.current.remove();
          chartInstanceRef.current = null;
        }

        // 动态导入并获取完整模块
        const module = await import('lightweight-charts');
        console.log('Imported module:', module);
        
        // 检查模块导出
        const createChartFn = module.createChart || module.default?.createChart;
        const ColorType = module.ColorType || module.default?.ColorType;
        
        if (!createChartFn) {
          throw new Error('createChart function not found');
        }

        console.log('Creating chart with function:', typeof createChartFn);

        // 创建图表配置
        const chartConfig: any = {
          width: chartContainerRef.current.clientWidth,
          height,
          layout: {
            textColor: 'rgba(33, 56, 77, 1)',
          },
          grid: {
            vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
            horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
          },
          rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
          },
          timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
          },
        };

        // 设置背景色
        if (ColorType) {
          chartConfig.layout.background = { type: ColorType.Solid, color: '#ffffff' };
        } else {
          chartConfig.layout.background = { color: '#ffffff' };
        }

        const chart = createChartFn(chartContainerRef.current, chartConfig);
        chartInstanceRef.current = chart;

        console.log('Chart created:', !!chart);
        console.log('Chart methods:', Object.getOwnPropertyNames(chart));

        // 创建K线图系列
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        console.log('Candlestick series created:', !!candlestickSeries);

        // 转换数据格式
        const chartData = stockData.map(item => ({
          time: Math.floor(new Date(item.tradeDate).getTime() / 1000),
          open: item.openPrice,
          high: item.highPrice,
          low: item.lowPrice,
          close: item.closePrice,
        }));

        console.log('Chart data:', chartData.slice(0, 3));

        // 设置数据
        candlestickSeries.setData(chartData);

        // 响应式处理
        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        // 清理函数
        return () => {
          window.removeEventListener('resize', handleResize);
          if (chart) {
            chart.remove();
          }
        };
      } catch (err) {
        console.error('初始化图表失败:', err);
        if (mounted) {
          setError('图表初始化失败: ' + (err instanceof Error ? err.message : '未知错误'));
        }
      }
    };

    initChart();

    return () => {
      mounted = false;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [stockData, height]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: height,
        background: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite',
            margin: '0 auto 10px'
          }}></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
        background: '#ffeaa7',
        borderRadius: '8px',
        color: '#2d3436'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>图表加载失败</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#0984e3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', background: '#ffffff', borderRadius: '8px', padding: '16px' }}>
      <div style={{ marginBottom: '16px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>股票代码: {stockCode}</h3>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {stockData.length > 0 && (
            <span>数据点数: {stockData.length}</span>
          )}
        </div>
      </div>
      <div 
        ref={chartContainerRef} 
        style={{ 
          height: `${height}px`,
          border: '1px solid #e0e0e0',
          borderRadius: '4px'
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default KLineChartFixed;