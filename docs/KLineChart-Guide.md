# K线图组件使用指南

## 📦 安装依赖

```bash
# 安装 LightweightCharts
npm install lightweight-charts

# 或使用 pnpm
pnpm add lightweight-charts

# 类型定义（如果使用 TypeScript）
npm install -D @types/lightweight-charts
```

## 🚀 快速开始

### 1. 基础使用

```tsx
import React from 'react';
import { KLineChart } from './components/KLineChart';

function App() {
  return (
    <div>
      <KLineChart
        stockCode="000001"
        symbol="平安银行"
        showVolume={true}
      />
    </div>
  );
}
```

### 2. 自定义配置

```tsx
import { KLineChart, CHART_PRESETS } from './components/KLineChart';

function CustomChart() {
  const config = {
    ...CHART_PRESETS.default,
    theme: 'dark',
    width: 1200,
    height: 600,
    layout: {
      background: { color: '#1e1e1e' },
      textColor: '#ffffff'
    }
  };

  return (
    <KLineChart
      stockCode="600519"
      symbol="贵州茅台"
      config={config}
      showVolume={true}
      onCrosshairMove={(data) => console.log('十字线数据:', data)}
    />
  );
}
```

### 3. 响应式设计

```tsx
import { useState, useEffect } from 'react';
import { KLineChart, CHART_PRESETS } from './components/KLineChart';

function ResponsiveChart() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <KLineChart
      stockCode="000001"
      config={isMobile ? CHART_PRESETS.mobile : CHART_PRESETS.default}
      showVolume={!isMobile} // 移动端不显示成交量
    />
  );
}
```

## 📊 数据接口集成

### 1. 连接您的股票数据API

```tsx
// api/stockData.ts
export interface StockDataResponse {
  success: boolean;
  data: DailyStockData[];
  total: number;
}

export const fetchStockData = async (
  stockCode: string,
  startDate?: string,
  endDate?: string
): Promise<StockDataResponse> => {
  const params = new URLSearchParams({
    stockCode,
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });

  const response = await fetch(`/api/stock-data?${params}`);
  return response.json();
};
```

### 2. 使用React Query进行数据管理

```tsx
import { useQuery } from '@tanstack/react-query';
import { KLineChart } from './components/KLineChart';
import { fetchStockData } from './api/stockData';

function DataDrivenChart({ stockCode }: { stockCode: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stockData', stockCode],
    queryFn: () => fetchStockData(stockCode),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <KLineChart
      stockCode={stockCode}
      initialData={data?.data}
      showVolume={true}
    />
  );
}
```

## 🎨 主题和样式定制

### 1. 预设主题

```tsx
import { KLineChart, COLOR_THEMES } from './components/KLineChart';

// 使用预设颜色主题
const config = {
  theme: 'dark',
  candlestick: {
    upColor: COLOR_THEMES.modern.upColor,
    downColor: COLOR_THEMES.modern.downColor
  }
};
```

### 2. 自定义主题

```tsx
const customTheme = {
  layout: {
    background: { color: '#0f0f23' },
    textColor: '#d1d5db'
  },
  grid: {
    vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
    horzLines: { color: 'rgba(42, 46, 57, 0.5)' }
  },
  candlestick: {
    upColor: '#10b981',
    downColor: '#ef4444',
    borderUpColor: '#10b981',
    borderDownColor: '#ef4444',
    wickUpColor: '#10b981',
    wickDownColor: '#ef4444'
  }
};

<KLineChart
  stockCode="000001"
  config={customTheme}
/>
```

## 💡 高级功能

### 1. 懒加载和分页

```tsx
function LazyLoadChart({ stockCode }: { stockCode: string }) {
  const [data, setData] = useState<DailyStockData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMoreData = async (visibleRange: any) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // 根据可视范围加载更多数据
      const newData = await fetchStockData(stockCode, visibleRange.from, visibleRange.to);
      setData(prev => [...prev, ...newData.data]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KLineChart
      stockCode={stockCode}
      initialData={data}
      onVisibleRangeChange={loadMoreData}
    />
  );
}
```

### 2. 技术指标集成

```tsx
// 计算移动平均线
const calculateMA = (data: DailyStockData[], period: number) => {
  return data.map((item, index) => {
    if (index < period - 1) return null;
    
    const sum = data
      .slice(index - period + 1, index + 1)
      .reduce((acc, curr) => acc + curr.closing_price, 0);
    
    return {
      time: item.trading_date,
      value: sum / period
    };
  }).filter(Boolean);
};

function ChartWithIndicators({ stockCode }: { stockCode: string }) {
  const [data, setData] = useState<DailyStockData[]>([]);
  const [showMA, setShowMA] = useState(false);

  // 添加移动平均线
  useEffect(() => {
    if (showMA && data.length > 0) {
      const ma20 = calculateMA(data, 20);
      // 将MA数据添加到图表中
    }
  }, [data, showMA]);

  return (
    <div>
      <button onClick={() => setShowMA(!showMA)}>
        {showMA ? '隐藏' : '显示'} MA20
      </button>
      <KLineChart
        stockCode={stockCode}
        initialData={data}
        showIndicators={showMA ? ['ma20'] : []}
      />
    </div>
  );
}
```

### 3. 实时数据更新

```tsx
function RealTimeChart({ stockCode }: { stockCode: string }) {
  const [data, setData] = useState<DailyStockData[]>([]);

  useEffect(() => {
    // WebSocket连接实时数据
    const ws = new WebSocket(`ws://localhost:3000/stock-data/${stockCode}`);
    
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(prev => [...prev, newData]);
    };

    return () => ws.close();
  }, [stockCode]);

  return (
    <KLineChart
      stockCode={stockCode}
      initialData={data}
      showVolume={true}
    />
  );
}
```

## 📱 移动端优化

### 1. 触摸手势支持

```css
/* 移动端样式优化 */
.kline-chart {
  touch-action: none; /* 防止默认滚动 */
  -webkit-user-select: none;
  user-select: none;
}

@media (max-width: 768px) {
  .kline-chart-container {
    height: 300px; /* 适合移动端的高度 */
  }
}
```

### 2. 响应式配置

```tsx
const getMobileConfig = () => ({
  width: window.innerWidth - 32,
  height: 300,
  layout: {
    fontSize: 10
  },
  timeScale: {
    barSpacing: 4,
    rightOffset: 2
  },
  rightPriceScale: {
    scaleMargins: { top: 0.15, bottom: 0.15 }
  }
});
```

## ⚡ 性能优化建议

### 1. 数据处理优化

```tsx
// 使用 Web Worker 处理大量数据
const processDataInWorker = (data: DailyStockData[]) => {
  return new Promise((resolve) => {
    const worker = new Worker('/workers/dataProcessor.js');
    worker.postMessage(data);
    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };
  });
};
```

### 2. 内存管理

```tsx
// 组件卸载时清理资源
useEffect(() => {
  return () => {
    // 清理图表实例
    chartRef.current?.remove();
    // 清理事件监听
    resizeObserver?.disconnect();
    // 清理缓存
    dataCache.clear();
  };
}, []);
```

### 3. 渲染优化

```tsx
// 使用 React.memo 防止不必要的重渲染
const OptimizedKLineChart = React.memo(KLineChart, (prevProps, nextProps) => {
  return (
    prevProps.stockCode === nextProps.stockCode &&
    prevProps.theme === nextProps.theme &&
    JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config)
  );
});
```

## 🛠️ 调试和故障排除

### 1. 常见问题

**问题**: 图表不显示
```tsx
// 检查容器尺寸
useEffect(() => {
  if (containerRef.current) {
    console.log('容器尺寸:', {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight
    });
  }
}, []);
```

**问题**: 数据格式错误
```tsx
// 验证数据格式
const validateData = (data: any[]) => {
  return data.every(item => 
    item.time && 
    typeof item.open === 'number' &&
    typeof item.high === 'number' &&
    typeof item.low === 'number' &&
    typeof item.close === 'number'
  );
};
```

### 2. 开发模式调试

```tsx
const DebugKLineChart = ({ stockCode, ...props }: KLineChartProps) => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 输出调试信息
      console.log('Chart Debug Info:', {
        stockCode,
        dataLength: props.initialData?.length,
        config: props.config
      });
    }
  }, [stockCode, props]);

  return <KLineChart stockCode={stockCode} {...props} />;
};
```

这个K线图组件提供了完整的股票图表解决方案，支持高性能渲染、响应式设计、主题定制和实时数据更新。通过合理的架构设计和性能优化，可以处理大量数据并提供流畅的用户体验。