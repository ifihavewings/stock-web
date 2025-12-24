// K线图组件完整类型定义系统

import { ChartOptions, DeepPartial } from 'lightweight-charts';

// 数据类型定义
export interface DailyStockData {
  record_id: number;
  stock_code: string;
  trading_date: string;
  opening_price: number;
  highest_price: number;
  lowest_price: number;
  closing_price: number;
  previous_closing_price?: number;
  price_change: number;
  price_change_percentage: number;
  trading_volume: number;
  trading_amount: number;
  turnover_rate: number;
  pe_ratio?: number;
  pb_ratio?: number;
  total_market_value?: number;
  circulating_market_value?: number;
}

// 技术指标类型定义
export interface IndicatorConfig {
  id: string;
  name: string;
  type: 'overlay' | 'oscillator';
  enabled: boolean;
  visible: boolean;
  color: string;
  lineWidth: number;
  params: Record<string, any>;
}

// 支持的技术指标
export interface MovingAverageConfig extends IndicatorConfig {
  type: 'overlay';
  params: {
    period: number;
    method: 'SMA' | 'EMA' | 'WMA';
    source: 'open' | 'high' | 'low' | 'close' | 'volume';
  };
}

export interface RSIConfig extends IndicatorConfig {
  type: 'oscillator';
  params: {
    period: number;
    overbought: number;
    oversold: number;
  };
}

export interface MACDConfig extends IndicatorConfig {
  type: 'oscillator';
  params: {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
  };
}

export interface BollingerBandsConfig extends IndicatorConfig {
  type: 'overlay';
  params: {
    period: number;
    stdDev: number;
  };
}

export interface KDJConfig extends IndicatorConfig {
  type: 'oscillator';
  params: {
    kPeriod: number;
    dPeriod: number;
    jPeriod: number;
  };
}

export type TechnicalIndicator = MovingAverageConfig | RSIConfig | MACDConfig | BollingerBandsConfig | KDJConfig;

// LightweightCharts所需的K线数据格式
export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  tradingAmount?: number;
  priceChange?: number | null;
  priceChangePercentage?: number | null;
}

// 成交量数据格式
export interface VolumeData {
  time: string;
  value: number;
  color?: string;
}

// 指标数据接口
export interface IndicatorData {
  time: string;
  value: number | number[];
  color?: string;
}

// 图表主题配置
export interface ChartTheme {
  name: string;
  background: string;
  textColor: string;
  gridColor: string;
  crosshairColor: string;
  borderColor: string;
  upColor: string;
  downColor: string;
  volumeUpColor: string;
  volumeDownColor: string;
}

// 预定义主题
export const CHART_THEMES: Record<string, ChartTheme> = {
  light: {
    name: '浅色主题',
    background: '#FFFFFF',
    textColor: '#333333',
    gridColor: '#E1E3E6',
    crosshairColor: '#758696',
    borderColor: '#D6DCDE',
    upColor: '#26A69A',
    downColor: '#EF5350',
    volumeUpColor: '#26A69A80',
    volumeDownColor: '#EF535080',
  },
  dark: {
    name: '深色主题',
    background: '#1E1E1E',
    textColor: '#FFFFFF',
    gridColor: '#333333',
    crosshairColor: '#758696',
    borderColor: '#444444',
    upColor: '#4CAF50',
    downColor: '#F44336',
    volumeUpColor: '#4CAF5080',
    volumeDownColor: '#F4433680',
  },
};

// K线图配置接口
export interface KLineChartConfig {
  width?: number;
  height?: number;
  theme?: 'light' | 'dark' | ChartTheme;
  showVolume?: boolean;
  volumeHeight?: number; // 成交量区域高度百分比
  showCrosshair?: boolean;
  showTimeScale?: boolean;
  showPriceScale?: boolean;
  indicators?: TechnicalIndicator[];
  autoScale?: boolean;
  rightOffset?: number;
  timezone?: string;
  locale?: string;
  candlestickOptions?: {
    upColor?: string;
    downColor?: string;
    wickUpColor?: string;
    wickDownColor?: string;
    borderUpColor?: string;
    borderDownColor?: string;
  };
  chartOptions?: DeepPartial<ChartOptions>;
}

// K线图组件属性接口
export interface KLineChartProps {
  stockCode: string;
  stockName?: string;
  symbol?: string;
  initialData?: CandlestickData[];
  config?: KLineChartConfig;
  onCrosshairMove?: (param: any) => void;
  onVisibleRangeChange?: (range: any) => void;
  onDataUpdate?: (data: CandlestickData[]) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  height?: number;
  enableRealtime?: boolean;
  realTimeInterval?: number; // 毫秒
}

// API查询参数
export interface StockDataQuery {
  stockCode: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// 数据转换工具
export class DataTransformer {
  /**
   * 将数据库数据转换为K线数据格式
   */
  static toCandlestickData(data: DailyStockData[]): CandlestickData[] {
    return data.map(item => ({
      time: item.trading_date,
      open: item.opening_price,
      high: item.highest_price,
      low: item.lowest_price,
      close: item.closing_price
    })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }

  /**
   * 将数据库数据转换为成交量数据格式
   */
  static toVolumeData(data: DailyStockData[]): VolumeData[] {
    return data.map(item => ({
      time: item.trading_date,
      value: item.trading_volume,
      color: item.price_change >= 0 ? '#26a69a' : '#ef5350'
    })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }

  /**
   * 批量处理数据
   */
  static processChartData(data: DailyStockData[]) {
    return {
      candlesticks: this.toCandlestickData(data),
      volumes: this.toVolumeData(data),
      summary: {
        total: data.length,
        dateRange: {
          start: data[0]?.trading_date,
          end: data[data.length - 1]?.trading_date
        }
      }
    };
  }
}