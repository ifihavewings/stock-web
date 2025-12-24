import { post, get } from '@/lib/request'

const prefix = '/stocks'

// 日K线数据高级查询接口
export function queryDailyKLineData(params?: Record<string, any>) {
  return post(`${prefix}/daily-kline/advanced-query`, params)
}

// 获取涨幅榜
export function getGainers(params?: Record<string, any>) {
  return get(`${prefix}/gainers`, params)
}

// 获取跌幅榜
export function getLosers(params?: Record<string, any>) {
  return get(`${prefix}/losers`, params)
}

// 获取成交量排行榜
export function getVolumeLeaders(params?: Record<string, any>) {
  return get(`${prefix}/volume-leaders`, params)
}

// 获取K线数据
export function getKLineData(stockCode: string, params?: Record<string, any>) {
  return get(`${prefix}/${stockCode}/kline`, params)
}

// 获取市场概况
export function getMarketOverview(params?: Record<string, any>) {
  return get(`${prefix}/market/overview`, params)
}

// 搜索股票
export function searchStocks(params?: Record<string, any>) {
  return get(`${prefix}/search`, params)
}