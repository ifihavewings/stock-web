import {list} from '@/lib/request'

const prefix = '/companies'
export function listCompaniesByIdOrCode(params?: Record<string, any>) {
  return list(prefix, params)
}