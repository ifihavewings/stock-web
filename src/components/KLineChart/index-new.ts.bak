// TradingView Lightweight Charts K线图组件库
// 完整的股票K线图解决方案，包含技术指标、实时数据等功能

// 核心组件
export { AdvancedKLineChart } from './AdvancedKLineChart';
export { KLineChartContainer, SimpleKLineChart } from './KLineChartContainer';
export { IndicatorConfigPanel } from './IndicatorConfigPanel';

// 数据服务
export { 
  KLineDataService,
  klineDataService,
  KLineDataTransformer,
  RealTimeManager 
} from './dataService';

// 技术指标
export { 
  TechnicalIndicators,
  INDICATOR_TEMPLATES 
} from './indicators';

// 类型定义
export type {
  CandlestickData,
  VolumeData,
  IndicatorData,
  TechnicalIndicator,
  MovingAverageConfig,
  RSIConfig,
  MACDConfig,
  BollingerBandsConfig,
  KLineChartConfig,
  KLineChartProps,
  ChartTheme,
  IndicatorConfig
} from './types';

export { 
  DataTransformer,
  CHART_THEMES 
} from './types';

// 使用示例和默认配置
export const DEFAULT_CHART_CONFIG = {
  theme: 'light' as const,
  showVolume: true,
  volumeHeight: 30,
  showCrosshair: true,
  showTimeScale: true,
  showPriceScale: true,
  autoScale: true,
  rightOffset: 20,
  indicators: []
};

// 预设指标组合
export const PRESET_INDICATOR_SETS = {
  // 基础组合
  basic: [
    { ...INDICATOR_TEMPLATES.sma20, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.ema12, enabled: true, visible: true },
  ],
  
  // 趋势分析
  trend: [
    { ...INDICATOR_TEMPLATES.sma5, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.sma10, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.sma20, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.bollinger, enabled: true, visible: true },
  ],
  
  // 震荡分析
  oscillator: [
    { ...INDICATOR_TEMPLATES.rsi14, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.macd, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.kdj, enabled: true, visible: true },
  ],
  
  // 全面分析
  comprehensive: [
    { ...INDICATOR_TEMPLATES.sma20, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.ema12, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.bollinger, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.rsi14, enabled: true, visible: true },
    { ...INDICATOR_TEMPLATES.macd, enabled: true, visible: true },
  ]
};