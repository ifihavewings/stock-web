// K线图数据服务 - 与后端API集成

import { CandlestickData, VolumeData, DailyStockData } from './types';

// API响应接口
export interface StockDataResponse {
  success: boolean;
  code: number;
  data: {
    data: Array<{
      recordId: number;
      stockCode: string;
      tradingDate: string;
      openingPrice: string;
      highestPrice: string;
      lowestPrice: string;
      closingPrice: string;
      previousClosingPrice: string | null;
      priceChange: string | null;
      priceChangePercentage: string | null;
      tradingVolume: string;
      tradingAmount: string;
      turnoverRate: string | null;
      peRatio: string | null;
      pbRatio: string | null;
      totalMarketValue: string | null;
      circulatingMarketValue: string | null;
      company?: {
        stockCode: string;
        stockSymbol: string;
        companyArea: string;
        industrySector: string;
        marketType: string;
        stockExchange: string;
        listingDate: string;
        isFavorite: number;
      };
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  ts: string;
  message?: string;
}

// 查询参数接口
export interface KLineDataQuery {
  stockCodeLike?: string;
  stockNameLike?: string;
  industrySectorLike?: string;
  startDate?: string;
  endDate?: string;
  minClosePrice?: number;
  maxClosePrice?: number;
  minPriceChangePercentage?: number;
  maxPriceChangePercentage?: number;
  minTradingVolume?: number;
  maxTradingVolume?: number;
  minTurnoverRate?: number;
  maxTurnoverRate?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

// API配置
const API_CONFIG = {
  BASE_URL: '', // 使用相对路径，通过Next.js代理转发到后端
  ENDPOINTS: {
    ADVANCED_QUERY: '/api/stocks/daily-kline/advanced-query',
    STOCK_INFO: '/api/stocks/stock-info',
    REALTIME: '/api/stocks/realtime'
  },
  TIMEOUT: 10000,
  CACHE_TTL: 5 * 60 * 1000, // 5分钟缓存
};

// 数据转换工具
export class KLineDataTransformer {
  /**
   * 将API数据转换为图表所需的K线数据格式
   */
  static toChartData(apiData: StockDataResponse): CandlestickData[] {
    // 处理新的后端数据结构
    if (!apiData.success || !apiData.data?.data) {
      return [];
    }

    return apiData.data.data
      .map(item => ({
        time: item.tradingDate,
        open: parseFloat(item.openingPrice),
        high: parseFloat(item.highestPrice),
        low: parseFloat(item.lowestPrice),
        close: parseFloat(item.closingPrice),
        volume: parseInt(item.tradingVolume),
        // 额外的数据字段
        tradingAmount: parseFloat(item.tradingAmount),
        priceChange: item.priceChange ? parseFloat(item.priceChange) : null,
        priceChangePercentage: item.priceChangePercentage ? parseFloat(item.priceChangePercentage) : null,
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()) // 确保时间顺序
      .filter(item => 
        // 数据验证
        item.open > 0 && 
        item.high > 0 && 
        item.low > 0 && 
        item.close > 0 &&
        item.high >= Math.max(item.open, item.close) &&
        item.low <= Math.min(item.open, item.close)
      );
  }

  /**
   * 将API数据转换为成交量数据格式
   */
  static toVolumeData(apiData: StockDataResponse): VolumeData[] {
    // 处理新的后端数据结构
    if (!apiData.success || !apiData.data?.data) {
      return [];
    }

    return apiData.data.data
      .map(item => ({
        time: item.tradingDate,
        value: parseInt(item.tradingVolume),
        color: (item.priceChange ? parseFloat(item.priceChange) : (parseFloat(item.closingPrice) - parseFloat(item.openingPrice))) >= 0 
          ? '#26a69a' 
          : '#ef5350'
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }

  /**
   * 批量转换数据
   */
  static transformAll(apiData: StockDataResponse) {
    return {
      candlestickData: this.toChartData(apiData),
      volumeData: this.toVolumeData(apiData),
      stockInfo: apiData.data?.data?.[0]?.company, // 取第一条记录的公司信息
      metadata: {
        total: apiData.data?.total || 0,
        page: apiData.data?.page || 1,
        limit: apiData.data?.pageSize || 100,
        success: apiData.success,
        message: apiData.message
      }
    };
  }
}

// 缓存管理器
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // 定期清理过期缓存
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  set(key: string, data: any, ttl: number = API_CONFIG.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// HTTP客户端
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL.replace(/\/$/, ''); // 移除末尾的斜杠
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时，请检查网络连接');
        }
        throw new Error(`网络请求失败: ${error.message}`);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// WebSocket 实时数据管理器
export class RealTimeManager {
  private ws: WebSocket | null = null;
  private callbacks = new Set<(data: any) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(private wsUrl: string) {}

  connect(stockCode: string): Promise<void> {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.wsUrl}?stock_code=${stockCode}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket连接已建立');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPing();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.callbacks.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error('实时数据回调函数错误:', error);
              }
            });
          } catch (error) {
            console.error('WebSocket消息解析失败:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket连接已关闭');
          this.isConnecting = false;
          this.stopPing();
          this.attemptReconnect(stockCode);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket错误:', error);
          this.isConnecting = false;
          reject(error);
        };

        // 连接超时
        setTimeout(() => {
          if (this.isConnecting) {
            this.ws?.close();
            this.isConnecting = false;
            reject(new Error('WebSocket连接超时'));
          }
        }, 5000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30秒ping一次
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect(stockCode: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket重连次数超过限制');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`${delay}ms后尝试第${this.reconnectAttempts}次重连...`);
    
    setTimeout(() => {
      this.connect(stockCode).catch(error => {
        console.error(`第${this.reconnectAttempts}次重连失败:`, error);
      });
    }, delay);
  }

  subscribe(callback: (data: any) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  disconnect(): void {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// 主数据服务类
export class KLineDataService {
  private apiClient: ApiClient;
  private cache: CacheManager;
  private realTimeManager: RealTimeManager | null = null;

  constructor(options: {
    baseURL?: string;
    timeout?: number;
    wsUrl?: string;
  } = {}) {
    this.apiClient = new ApiClient(options.baseURL, options.timeout);
    this.cache = new CacheManager();
    
    if (options.wsUrl) {
      this.realTimeManager = new RealTimeManager(options.wsUrl);
    }
  }

  /**
   * 获取K线数据（基础API）
   */
  async getKLineData(
    query: KLineDataQuery,
    useCache: boolean = true
  ): Promise<{
    candlestickData: CandlestickData[];
    volumeData: VolumeData[];
    stockInfo: any;
    metadata: any;
  }> {
    const cacheKey = `kline_${query.stockCodeLike || ''}_${query.startDate || ''}_${query.endDate || ''}_${query.pageSize || ''}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.apiClient.post<StockDataResponse>(
        API_CONFIG.ENDPOINTS.ADVANCED_QUERY,
        query
      );

      const transformedData = KLineDataTransformer.transformAll(response);
      
      if (useCache && transformedData.candlestickData.length > 0) {
        this.cache.set(cacheKey, transformedData);
      }

      return transformedData;
    } catch (error) {
      throw new Error(`获取K线数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取K线数据（高级查询API）
   */
  async getAdvancedKLineData(
    query: KLineDataQuery,
    useCache: boolean = true
  ): Promise<{
    candlestickData: CandlestickData[];
    volumeData: VolumeData[];
    stockInfo: any;
    metadata: any;
  }> {
    const cacheKey = `advanced_kline_${query.stockCodeLike || ''}_${query.startDate || ''}_${query.endDate || ''}_${query.pageSize || ''}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.apiClient.post<StockDataResponse>(
        API_CONFIG.ENDPOINTS.ADVANCED_QUERY,
        query
      );

      const transformedData = KLineDataTransformer.transformAll(response);
      
      if (useCache && transformedData.candlestickData.length > 0) {
        this.cache.set(cacheKey, transformedData);
      }

      return transformedData;
    } catch (error) {
      throw new Error(`获取高级K线数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取股票信息
   */
  async getStockInfo(stockCode: string, useCache: boolean = true) {
    const cacheKey = `stock_info_${stockCode}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.apiClient.get(
        API_CONFIG.ENDPOINTS.STOCK_INFO,
        { stock_code: stockCode }
      );

      if (useCache) {
        this.cache.set(cacheKey, response, 30 * 60 * 1000); // 30分钟缓存
      }

      return response;
    } catch (error) {
      throw new Error(`获取股票信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 启用实时数据
   */
  async enableRealTimeData(
    stockCode: string,
    callback: (data: any) => void
  ): Promise<() => void> {
    if (!this.realTimeManager) {
      throw new Error('实时数据服务未配置');
    }

    await this.realTimeManager.connect(stockCode);
    return this.realTimeManager.subscribe(callback);
  }

  /**
   * 禁用实时数据
   */
  disableRealTimeData(): void {
    if (this.realTimeManager) {
      this.realTimeManager.disconnect();
    }
  }

  /**
   * 检查实时连接状态
   */
  isRealTimeConnected(): boolean {
    return this.realTimeManager?.isConnected() ?? false;
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.cache.destroy();
    if (this.realTimeManager) {
      this.realTimeManager.disconnect();
    }
  }
}

// 创建默认服务实例
export const klineDataService = new KLineDataService({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  wsUrl: process.env.NEXT_PUBLIC_WS_URL,
});