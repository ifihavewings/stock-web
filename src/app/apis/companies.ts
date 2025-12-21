import {list, post, get} from '@/lib/request'

const prefix = '/companies'

// 普通列表查询（支持筛选）
export function listCompaniesByIdOrCode(params?: Record<string, any>) {
  return list(prefix, params)
}

// 模糊搜索接口（专门的搜索功能，排序更好）
export function searchCompanies(params?: Record<string, any>) {
  return list(`${prefix}/search`, params)
}

// 收藏/取消收藏股票
export function favoriteStock(stockCode: string) {
  return post(`${prefix}/favorite/${stockCode}`)
}

// 获取收藏的股票列表
export function getFavoriteStocks(params?: Record<string, any>) {
  debugger
  return get(`${prefix}/favorites`, params)
}