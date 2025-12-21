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

interface SimpleKLineChartProps {
  stockCode: string;
  height?: number;
}

const SimpleKLineChart: React.FC<SimpleKLineChartProps> = ({ 
  stockCode, 
  height = 600
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
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
    const initChart = async () => {
      if (!chartContainerRef.current || stockData.length === 0) return;

      try {
        // 动态导入LightweightCharts
        const { createChart } = await import('lightweight-charts');
        
        console.log('LightweightCharts 导入成功');

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height,
          layout: {
            background: { color: '#ffffff' },
            textColor: 'rgba(33, 56, 77, 1)',
          },
          grid: {
            vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
            horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
          },
        });
        
        console.log('Chart 创建成功:', !!chart);
        
        if (!chart) {
          throw new Error('图表对象创建失败');
        }

        // 创建K线图系列 - 使用类型断言来避免TypeScript错误
        const candlestickSeries = (chart as any).addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        console.log('CandlestickSeries 创建成功:', !!candlestickSeries);

        // 转换数据格式
        const chartData = stockData.map(item => ({
          time: Math.floor(new Date(item.tradeDate).getTime() / 1000),
          open: item.openPrice,
          high: item.highPrice,
          low: item.lowPrice,
          close: item.closePrice,
        }));

        // 设置数据
        candlestickSeries.setData(chartData);

        // 响应式处理
        const handleResize = () => {
          if (chartContainerRef.current) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      } catch (err) {
        console.error('初始化图表失败:', err);
        console.error('错误详情:', {
          errorMessage: err instanceof Error ? err.message : '未知错误',
          stockDataLength: stockData.length,
          containerRef: !!chartContainerRef.current
        });
        setError('图表初始化失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
    };

    initChart();
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
          <h3>数据加载失败</h3>
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

export default SimpleKLineChart;