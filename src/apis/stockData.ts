// 股票数据相关的API调用函数

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// 通用API请求函数
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// 股票数据类型定义
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
  record_creation_timestamp: string;
  record_update_timestamp: string;
}

export interface StockChartDataResponse {
  success: boolean;
  data: DailyStockData[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  summary: {
    stockCode: string;
    dateRange: {
      start?: string;
      end?: string;
    };
    dataPoints: number;
  };
  error?: string;
}

export interface StockInfoResponse {
  success: boolean;
  data: {
    company: {
      stockCode: string;
      stockSymbol: string;
      companyArea: string;
      industrySector: string;
      marketType: string;
      stockExchange: string;
      listingDate: string;
    };
    latestPrice: {
      closingPrice: number;
      priceChange: number;
      priceChangePercentage: number;
      tradingVolume: bigint;
      tradingDate: string;
    } | null;
  };
  error?: string;
}

export interface StockStatsResponse {
  success: boolean;
  data: {
    period: string;
    dataPoints: number;
    priceRange: {
      max: number;
      min: number;
      avg: number;
    };
    priceChange: {
      absolute: number;
      percentage: number;
    };
    volume: {
      avg: number;
      total: number;
    };
    volatility: number;
  } | null;
  error?: string;
}

/**
 * 获取股票K线图表数据
 * @param stockCode 股票代码
 * @param options 查询选项
 * @returns K线数据
 */
export async function fetchStockChartData(
  stockCode: string,
  options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<StockChartDataResponse> {
  const searchParams = new URLSearchParams();
  
  if (options.startDate) searchParams.set('startDate', options.startDate);
  if (options.endDate) searchParams.set('endDate', options.endDate);
  if (options.limit) searchParams.set('limit', options.limit.toString());
  if (options.offset) searchParams.set('offset', options.offset.toString());

  const endpoint = `stock-data-fetcher/chart/${stockCode}${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  return apiRequest<StockChartDataResponse>(endpoint);
}

// 辅助函数：处理日期范围
export function getDateRange(period: string): {
  startDate: string;
  endDate: string;
} {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

// 辅助函数：转换数据格式给K线图组件使用
export function transformToKLineData(data: DailyStockData[]): Array<{
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}> {
  return data.map(item => ({
    time: item.trading_date,
    open: item.opening_price,
    high: item.highest_price,
    low: item.lowest_price,
    close: item.closing_price,
    volume: item.trading_volume,
  }));
}

export default {
  fetchStockChartData,
  getDateRange,
  transformToKLineData,
};