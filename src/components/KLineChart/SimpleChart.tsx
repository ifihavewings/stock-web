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

const SimpleChart: React.FC<KLineChartProps> = ({ 
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
    if (!stockData.length || !chartContainerRef.current) return;

    const container = chartContainerRef.current;
    
    // 等待DOM完全准备好
    const timer = setTimeout(async () => {
      try {
        // 清空容器
        container.innerHTML = '';
        
        // 动态导入lightweight-charts
        const LightweightCharts = await import('lightweight-charts');
        console.log('LightweightCharts module:', LightweightCharts);
        
        // 获取createChart函数
        const createChart = LightweightCharts.createChart || LightweightCharts.default?.createChart;
        
        if (!createChart) {
          throw new Error('createChart function not available');
        }

        // 创建图表
        const chart = createChart(container, {
          width: container.offsetWidth,
          height: height,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
          rightPriceScale: {
            borderColor: '#cccccc',
          },
          timeScale: {
            borderColor: '#cccccc',
          },
        });

        console.log('Chart created successfully:', chart);
        console.log('Available methods:', Object.getOwnPropertyNames(chart));

        // 尝试添加K线图系列 - 使用any类型避免TypeScript错误
        let candlestickSeries;
        const chartAny = chart as any;
        
        if (typeof chartAny.addCandlestickSeries === 'function') {
          console.log('使用K线图模式');
          candlestickSeries = chartAny.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
        } else if (typeof chartAny.addLineSeries === 'function') {
          // 如果不支持K线图，使用线性图代替
          console.log('K线图不可用，使用线性图模式');
          candlestickSeries = chartAny.addLineSeries({
            color: '#2196F3',
            lineWidth: 2,
          });
        } else {
          throw new Error('图表库不支持K线图或线性图');
        }

        console.log('图表系列创建成功:', !!candlestickSeries);

        // 转换数据格式
        let chartData;
        
        console.log('原始股票数据示例:', stockData.slice(0, 3));
        
        if (typeof chartAny.addCandlestickSeries === 'function') {
          // K线图数据
          chartData = stockData.map(item => {
            const timeStamp = Math.floor(new Date(item.tradeDate).getTime() / 1000);
            return {
              time: timeStamp,
              open: Number(item.openPrice),
              high: Number(item.highPrice),
              low: Number(item.lowPrice),
              close: Number(item.closePrice),
            };
          }).sort((a, b) => a.time - b.time); // 按时间排序
        } else {
          // 线性图数据（只用收盘价）
          chartData = stockData.map(item => {
            const timeStamp = Math.floor(new Date(item.tradeDate).getTime() / 1000);
            return {
              time: timeStamp,
              value: Number(item.closePrice),
            };
          }).sort((a, b) => a.time - b.time); // 按时间排序
        }

        console.log('转换后的图表数据示例:', chartData.slice(0, 3));
        console.log('数据总数:', chartData.length);

        // 验证数据有效性
        const validData = chartData.filter(item => {
          if (chartData[0].hasOwnProperty('open')) {
            // K线数据验证
            return !isNaN(item.time) && !isNaN(item.open) && !isNaN(item.high) && !isNaN(item.low) && !isNaN(item.close);
          } else {
            // 线性数据验证
            return !isNaN(item.time) && !isNaN(item.value);
          }
        });

        console.log('有效数据数量:', validData.length);

        if (validData.length === 0) {
          throw new Error('没有有效的图表数据');
        }

        // 设置数据
        candlestickSeries.setData(validData);

        // 调整视图以适应数据
        setTimeout(() => {
          try {
            chart.timeScale().fitContent();
          } catch (e) {
            console.warn('fitContent failed:', e);
          }
        }, 100);

        console.log('Data set successfully');

        // 响应式处理
        const handleResize = () => {
          if (container && chart) {
            chart.applyOptions({
              width: container.offsetWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        // 清理函数
        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };

      } catch (err) {
        console.error('图表初始化失败:', err);
        setError('图表初始化失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
    }, 100); // 延迟100ms确保DOM准备好

    return () => clearTimeout(timer);
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
          <p>加载K线数据中...</p>
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
        background: '#ffebee',
        borderRadius: '8px',
        color: '#c62828'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>图表加载失败</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            重新加载
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
            <>
              <span>数据点数: {stockData.length} | </span>
              <span>日期范围: {stockData[0]?.tradeDate} 至 {stockData[stockData.length - 1]?.tradeDate}</span>
            </>
          )}
        </div>
      </div>
      <div 
        ref={chartContainerRef} 
        style={{ 
          height: `${height}px`,
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          fontSize: '12px',
          color: '#666',
          background: 'rgba(255,255,255,0.8)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          K线图
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimpleChart;