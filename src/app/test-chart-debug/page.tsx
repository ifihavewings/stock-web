'use client';

import React, { useEffect, useRef } from 'react';

const TestChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChart = async () => {
      if (!chartContainerRef.current) return;

      try {
        console.log('开始导入 lightweight-charts...');
        
        // 尝试不同的导入方式
        const lightweightCharts = await import('lightweight-charts');
        console.log('LightweightCharts 导入结果:', lightweightCharts);
        console.log('可用方法:', Object.keys(lightweightCharts));
        
        const { createChart } = lightweightCharts;
        console.log('createChart 函数:', typeof createChart);
        
        if (!createChart) {
          throw new Error('createChart 函数不存在');
        }

        const chart = createChart(chartContainerRef.current, {
          width: 600,
          height: 300,
        });

        console.log('Chart 对象:', chart);
        console.log('Chart 原型方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(chart)));
        
        // 检查可用的方法
        const chartAny = chart as any;
        console.log('addCandlestickSeries:', typeof chartAny.addCandlestickSeries);
        console.log('addLineSeries:', typeof chartAny.addLineSeries);
        console.log('addAreaSeries:', typeof chartAny.addAreaSeries);

        if (typeof chartAny.addCandlestickSeries !== 'function') {
          throw new Error('addCandlestickSeries 方法不存在');
        }

        const candlestickSeries = chartAny.addCandlestickSeries();

        // 模拟数据
        const data = [
          { time: 1642425600, open: 10, high: 10.63, low: 9.49, close: 9.55 },
          { time: 1642512000, open: 9.55, high: 10.30, low: 9.42, close: 9.94 },
          { time: 1642598400, open: 9.94, high: 10.17, low: 9.92, close: 9.78 },
        ];

        candlestickSeries.setData(data);

        console.log('✅ 测试图表创建成功');

        return () => {
          chart.remove();
        };

      } catch (error) {
        console.error('❌ 测试图表创建失败:', error);
        console.error('错误类型:', typeof error);
        console.error('错误信息:', error instanceof Error ? error.message : String(error));
      }
    };

    initChart();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h3>LightweightCharts 测试</h3>
      <div ref={chartContainerRef} style={{ border: '1px solid #ccc' }} />
      <p>请检查浏览器控制台查看详细日志</p>
    </div>
  );
};

export default TestChart;