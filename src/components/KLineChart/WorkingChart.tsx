'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StockData {
  tradingDate: string;
  openingPrice: string;
  highestPrice: string;
  lowestPrice: string;
  closingPrice: string;
  tradingVolume: string;
  stockCode: string;
}

interface KLineChartProps {
  stockCode: string;
  height?: number;
}

const WorkingChart: React.FC<KLineChartProps> = ({ 
  stockCode, 
  height = 600
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:1688/stock-data-fetcher/chart/${stockCode}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('获取的原始响应数据:', responseData);
        
        // 检查 API 响应是否成功
        if (!responseData.success) {
          throw new Error(responseData.message || 'API 请求失败');
        }
        
        // 获取嵌套的数据数组 - data.data
        const dataContainer = responseData.data;
        if (!dataContainer || typeof dataContainer !== 'object') {
          throw new Error('响应中没有找到data字段');
        }
        
        const data = dataContainer.data;
        if (!data || !Array.isArray(data)) {
          throw new Error('数据格式错误 - 嵌套的data字段不是数组');
        }

        if (data.length === 0) {
          throw new Error('没有找到股票数据');
        }

        console.log('获取到的股票数据:', data.slice(0, 3));
        console.log('总数据条数:', data.length);
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

    let chart: any = null;

    const initChart = async () => {
      try {
        const container = chartContainerRef.current!;
        
        // 确保容器有尺寸
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.warn('容器尺寸为0，等待DOM准备');
          setTimeout(initChart, 100);
          return;
        }

        // 清空容器
        container.innerHTML = '';
        
        console.log('开始初始化图表，容器尺寸:', container.offsetWidth, 'x', container.offsetHeight);

        // 动态导入lightweight-charts
        const module = await import('lightweight-charts');
        console.log('LightweightCharts模块:', module);
        
        const createChart = module.createChart || (module as any).default?.createChart;
        
        if (!createChart) {
          throw new Error('无法找到createChart函数');
        }

        // 创建图表
        chart = createChart(container, {
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
            timeVisible: true,
            secondsVisible: false,
          },
        });

        console.log('图表创建成功');

        // 尝试创建K线图系列
        let series: any;
        
        try {
          series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
          setChartType('candlestick');
          console.log('K线图系列创建成功');
        } catch (e) {
          console.warn('K线图创建失败，使用线性图:', e);
          series = chart.addLineSeries({
            color: '#2196F3',
            lineWidth: 2,
          });
          setChartType('line');
          console.log('线性图系列创建成功');
        }

        // 准备数据
        let chartData: any[];
        
        if (chartType === 'candlestick') {
          chartData = stockData.map(item => ({
            time: Math.floor(new Date(item.tradingDate).getTime() / 1000),
            open: parseFloat(String(item.openingPrice)),
            high: parseFloat(String(item.highestPrice)),
            low: parseFloat(String(item.lowestPrice)),
            close: parseFloat(String(item.closingPrice)),
          }));
        } else {
          chartData = stockData.map(item => ({
            time: Math.floor(new Date(item.tradingDate).getTime() / 1000),
            value: parseFloat(String(item.closingPrice)),
          }));
        }

        // 按时间排序
        chartData.sort((a, b) => a.time - b.time);
        
        console.log('准备设置数据:', chartData.slice(0, 3));
        console.log('数据总数:', chartData.length);

        // 设置数据
        series.setData(chartData);
        
        console.log('数据设置完成');

        // 自适应视图
        setTimeout(() => {
          try {
            chart.timeScale().fitContent();
            console.log('视图自适应完成');
          } catch (e) {
            console.warn('视图自适应失败:', e);
          }
        }, 200);

      } catch (err) {
        console.error('图表初始化失败:', err);
        setError('图表初始化失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
    };

    const timer = setTimeout(initChart, 100);

    return () => {
      clearTimeout(timer);
      if (chart) {
        try {
          chart.remove();
        } catch (e) {
          console.warn('图表清理失败:', e);
        }
      }
    };
  }, [stockData, height, chartType]);

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
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
          股票代码: {stockCode}
          <span style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginLeft: '10px',
            background: chartType === 'candlestick' ? '#e8f5e8' : '#e3f2fd',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {chartType === 'candlestick' ? 'K线图' : '线性图'}
          </span>
        </h3>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {stockData.length > 0 && (
            <>
              <span>数据点数: {stockData.length} | </span>
              <span>日期范围: {stockData[0]?.tradingDate} 至 {stockData[stockData.length - 1]?.tradingDate}</span>
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
          position: 'relative',
          minHeight: `${height}px`
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

export default WorkingChart;