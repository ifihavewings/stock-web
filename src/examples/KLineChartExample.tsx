import React, { useState, useEffect } from 'react';
import { KLineChart, CHART_PRESETS, COLOR_THEMES } from '../components/KLineChart';
import type { DailyStockData, KLineChartConfig } from '../components/KLineChart/types';

/**
 * K线图使用示例
 * 展示了各种配置和使用场景
 */
const KLineChartExample: React.FC = () => {
  const [stockCode, setStockCode] = useState('000001');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [preset, setPreset] = useState<'default' | 'compact' | 'mobile'>('default');
  const [showVolume, setShowVolume] = useState(true);
  const [crosshairData, setCrosshairData] = useState<any>(null);

  // 模拟股票数据
  const [mockData, setMockData] = useState<DailyStockData[]>([]);

  useEffect(() => {
    // 生成模拟数据
    const generateMockData = (days: number = 100): DailyStockData[] => {
      const data: DailyStockData[] = [];
      let price = 100 + Math.random() * 50;

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));

        const change = (Math.random() - 0.5) * 4;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;

        data.push({
          record_id: i + 1,
          stock_code: stockCode,
          trading_date: date.toISOString().split('T')[0],
          opening_price: Number(open.toFixed(2)),
          highest_price: Number(high.toFixed(2)),
          lowest_price: Number(low.toFixed(2)),
          closing_price: Number(close.toFixed(2)),
          price_change: Number(change.toFixed(2)),
          price_change_percentage: Number(((change / price) * 100).toFixed(2)),
          trading_volume: Math.floor(Math.random() * 10000000),
          trading_amount: Math.floor(Math.random() * 1000000000),
          turnover_rate: Number((Math.random() * 10).toFixed(2))
        });

        price = close;
      }

      return data;
    };

    setMockData(generateMockData());
  }, [stockCode]);

  // 图表配置
  const chartConfig: KLineChartConfig = {
    ...CHART_PRESETS[preset],
    theme,
    layout: {
      ...CHART_PRESETS[preset].layout,
      background: { color: theme === 'dark' ? '#1e1e1e' : '#ffffff' },
      textColor: theme === 'dark' ? '#d1d4dc' : '#333333'
    }
  };

  // 十字线移动事件
  const handleCrosshairMove = (param: any) => {
    setCrosshairData(param);
  };

  // 可见范围变化事件
  const handleVisibleRangeChange = (range: any) => {
    console.log('Visible range changed:', range);
    // 这里可以实现懒加载更多数据
  };

  return (
    <div style={{ padding: '20px', background: theme === 'dark' ? '#141414' : '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: theme === 'dark' ? '#ffffff' : '#000000', marginBottom: '20px' }}>
        K线图组件示例
      </h1>

      {/* 控制面板 */}
      <div style={{
        background: theme === 'dark' ? '#2a2a2a' : '#ffffff',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ color: theme === 'dark' ? '#ffffff' : '#000000', marginRight: '8px' }}>
              股票代码:
            </label>
            <select
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                background: theme === 'dark' ? '#404040' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000'
              }}
            >
              <option value="000001">平安银行 (000001)</option>
              <option value="000002">万科A (000002)</option>
              <option value="600036">招商银行 (600036)</option>
              <option value="600519">贵州茅台 (600519)</option>
              <option value="000858">五粮液 (000858)</option>
            </select>
          </div>

          <div>
            <label style={{ color: theme === 'dark' ? '#ffffff' : '#000000', marginRight: '8px' }}>
              主题:
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                background: theme === 'dark' ? '#404040' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000'
              }}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>

          <div>
            <label style={{ color: theme === 'dark' ? '#ffffff' : '#000000', marginRight: '8px' }}>
              预设:
            </label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as any)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                background: theme === 'dark' ? '#404040' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000'
              }}
            >
              <option value="default">默认</option>
              <option value="compact">紧凑</option>
              <option value="mobile">移动端</option>
            </select>
          </div>

          <div>
            <label style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              显示成交量
            </label>
          </div>
        </div>
      </div>

      {/* 十字线信息面板 */}
      {crosshairData && crosshairData.seriesData && (
        <div style={{
          background: theme === 'dark' ? '#2a2a2a' : '#ffffff',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '14px',
          color: theme === 'dark' ? '#ffffff' : '#000000'
        }}>
          <strong>当前数据点信息:</strong>
          {crosshairData.seriesData.size > 0 && (
            <div style={{ marginTop: '8px' }}>
              <span>时间: {crosshairData.time} | </span>
              {Array.from(crosshairData.seriesData.entries()).map(([series, data], index) => (
                <span key={index}>
                  开: {data.open?.toFixed(2)} | 
                  高: {data.high?.toFixed(2)} | 
                  低: {data.low?.toFixed(2)} | 
                  收: {data.close?.toFixed(2)}
                  {data.value && ` | 量: ${(data.value / 10000).toFixed(0)}万`}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* K线图组件 */}
      <div style={{ marginBottom: '20px' }}>
        <KLineChart
          stockCode={stockCode}
          symbol={`${getStockName(stockCode)} (${stockCode})`}
          config={chartConfig}
          showVolume={showVolume}
          onCrosshairMove={handleCrosshairMove}
          onVisibleRangeChange={handleVisibleRangeChange}
          style={{
            border: '1px solid #e8e8e8',
            borderRadius: '8px'
          }}
        />
      </div>

      {/* 说明文档 */}
      <div style={{
        background: theme === 'dark' ? '#2a2a2a' : '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      }}>
        <h3>使用说明</h3>
        <div style={{ lineHeight: '1.6' }}>
          <h4>基础使用:</h4>
          <pre style={{
            background: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            color: theme === 'dark' ? '#ffffff' : '#000000'
          }}>
{`import { KLineChart } from './components/KLineChart';

// 基础用法
<KLineChart
  stockCode="000001"
  symbol="平安银行"
  showVolume={true}
/>

// 自定义配置
<KLineChart
  stockCode="000001"
  symbol="平安银行"
  config={{
    theme: 'dark',
    width: 1000,
    height: 500
  }}
  onCrosshairMove={(data) => console.log(data)}
  onVisibleRangeChange={(range) => loadMoreData(range)}
/>`}
          </pre>

          <h4>特性:</h4>
          <ul>
            <li>✅ 支持大数据量渲染（10万+ 数据点）</li>
            <li>✅ 响应式设计，适配各种屏幕尺寸</li>
            <li>✅ 主题切换（明亮/暗色主题）</li>
            <li>✅ 交互式十字线和缩放</li>
            <li>✅ 成交量柱状图显示</li>
            <li>✅ 懒加载和数据分页支持</li>
            <li>✅ 流畅的动画和过渡效果</li>
            <li>✅ TypeScript 完整类型支持</li>
          </ul>

          <h4>性能优化:</h4>
          <ul>
            <li>📊 数据虚拟化 - 只渲染可视区域</li>
            <li>🚀 Canvas硬件加速</li>
            <li>💾 智能缓存机制</li>
            <li>⚡ 防抖更新策略</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 获取股票名称的辅助函数
function getStockName(code: string): string {
  const stockNames: Record<string, string> = {
    '000001': '平安银行',
    '000002': '万科A',
    '600036': '招商银行',
    '600519': '贵州茅台',
    '000858': '五粮液'
  };
  return stockNames[code] || code;
}

export default KLineChartExample;