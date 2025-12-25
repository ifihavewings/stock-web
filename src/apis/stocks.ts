import { post } from '@/lib/request'

const prefix = '/stocks'

// 日K线数据高级查询接口
export function queryDailyKLineData(params?: Record<string, any>) {
  return post(`${prefix}/daily-kline/advanced-query`, params)
}