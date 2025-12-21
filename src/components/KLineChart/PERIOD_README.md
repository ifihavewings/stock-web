# K线周期切换功能说明

## 功能概述
支持在日K、周K、月K之间切换查看，数据库只存储日K线数据，前端实时聚合转换。

## 实现原理

### 1. 数据转换逻辑 (`periodConverter.ts`)

#### 周K线转换
- 按周聚合日K线数据
- 开盘价：取该周第一个交易日的开盘价
- 收盘价：取该周最后一个交易日的收盘价
- 最高价：取该周所有交易日的最高价
- 最低价：取该周所有交易日的最低价
- 成交量：该周所有交易日成交量之和
- 成交额：该周所有交易日成交额之和

#### 月K线转换
- 按月聚合日K线数据
- 开盘价：取该月第一个交易日的开盘价
- 收盘价：取该月最后一个交易日的收盘价
- 最高价：取该月所有交易日的最高价
- 最低价：取该月所有交易日的最低价
- 成交量：该月所有交易日成交量之和
- 成交额：该月所有交易日成交额之和

### 2. 状态管理

```typescript
const [rawDailyData, setRawDailyData] = useState<CandlestickData[]>([]); // 原始日K数据
const [chartData, setChartData] = useState<CandlestickData[]>([]);        // 当前显示的数据
const [currentPeriod, setCurrentPeriod] = useState<KLinePeriod>('day');  // 当前周期
```

### 3. 数据流转

1. **加载数据**：从API获取日K线数据，保存到 `rawDailyData`
2. **初始显示**：根据 `currentPeriod` 转换数据，默认为日K
3. **切换周期**：点击按钮切换周期，从 `rawDailyData` 重新转换数据

### 4. UI组件

工具栏左侧显示三个切换按钮：
- 日K：显示原始日K线数据
- 周K：显示聚合后的周K线数据  
- 月K：显示聚合后的月K线数据

## 使用方式

```tsx
<KLineChartContainer
  stockCode="688150"
  stockName="莱特光电"
  showControls={true}  // 显示工具栏，包含周期切换按钮
  autoLoad={true}
  defaultTimeRange="2Y"
/>
```

## 优势

1. **节省存储**：数据库只需存储日K线数据
2. **实时转换**：前端实时聚合，无需后端计算
3. **灵活扩展**：可轻松添加其他周期（如季K、年K）
4. **数据一致**：所有周期数据源自同一份日K数据，保证一致性

## 性能考虑

- 数据转换在客户端进行，时间复杂度 O(n)
- 2年日K数据约500条，转换为周K约100条，月K约24条
- 转换速度极快，用户几乎无感知
- 原始数据缓存在内存，切换周期无需重新请求API

## 扩展建议

如需添加更多周期：

1. 在 `KLinePeriod` 类型中添加新周期
2. 在 `KLinePeriodConverter` 中实现转换方法
3. 在 UI 按钮数组中添加新选项
4. 在 `getPeriodLabel` 中添加显示文本
