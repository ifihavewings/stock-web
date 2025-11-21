import {list} from '@/lib/request'

const prefix = '/companies'

// 普通列表查询（支持筛选）
export function listCompaniesByIdOrCode(params?: Record<string, any>) {
  return list(prefix, params)
}

// 模糊搜索接口（专门的搜索功能，排序更好）
export function searchCompanies(params?: Record<string, any>) {
  return list(`${prefix}/search`, params)
}