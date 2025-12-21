// K线图组件类型定义

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

// LightweightCharts所需的K线数据格式
export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// 成交量数据格式
export interface VolumeData {
  time: string;
  value: number;
  color?: string;
}

// K线图配置接口
export interface KLineChartConfig {
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  timezone?: string;
  locale?: string;
  crosshair?: {
    mode?: number;
    vertLine?: object;
    horzLine?: object;
  };
  grid?: {
    vertLines?: { color: string; style?: number };
    horzLines?: { color: string; style?: number };
  };
  layout?: {
    background?: { color: string };
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
  };
  rightPriceScale?: {
    borderColor?: string;
    scaleMargins?: { top: number; bottom: number };
    mode?: number;
  };
  timeScale?: {
    borderColor?: string;
    timeVisible?: boolean;
    secondsVisible?: boolean;
    rightOffset?: number;
    barSpacing?: number;
    minBarSpacing?: number;
  };
}

// K线图组件属性接口
export interface KLineChartProps {
  stockCode: string;
  symbol?: string;
  initialData?: CandlestickData[];
  config?: KLineChartConfig;
  showVolume?: boolean;
  showIndicators?: string[];
  onCrosshairMove?: (param: any) => void;
  onVisibleRangeChange?: (range: any) => void;
  className?: string;
  style?: React.CSSProperties;
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