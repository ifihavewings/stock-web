import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * request.ts — Lightweight axios wrapper (RESTful helpers)
 *
 * Purpose:
 * - Provide a single axios instance with centralized token injection, timeout and error formatting.
 * - Offer resource-oriented helper functions (list/retrieve/create/update/remove) to follow a RESTful style.
 * - Keep low-level helpers (get/post/put/patch/delete) for custom requests.
 *
 * REST conventions used in this module:
 * - Resources are represented by collection paths, e.g. `/api/stocks` for the stocks collection.
 * - list:    GET /resource?query...         -> use list(resource, params)
 * - retrieve:GET /resource/{id}             -> use retrieve(resource, id)
 * - create:  POST /resource (body)          -> use create(resource, data)
 * - update:  PUT /resource/{id} (body)     -> use update(resource, id, data)
 * - patch:   PATCH /resource/{id} (partial) -> use patch(url, data) or update as needed
 * - remove:  DELETE /resource/{id}         -> use remove(resource, id)
 *
 * Query parameter serialization:
 * - Arrays are serialized as repeated keys: `?tag=a&tag=b`.
 * - Objects are serialized with JSON.stringify as the value.
 *
 * Error and return conventions:
 * - By default this wrapper returns `res.data` (actual shape depends on backend).
 * - On error it throws a structured error object containing `status`, `message` and `data`.
 *
 * Authentication:
 * - Use `setAuthToken(token)` to inject a Bearer token at runtime (useful for SPA or token-based APIs).
 * - For improved security in production prefer HttpOnly cookies + server-side session validation.
 *
 * Example usage:
 * import { list, retrieve, create, update, remove, setAuthToken } from '@/lib/request'
 * await list('/api/stocks', { q: '600000', page: 1 })
 * await retrieve('/api/stocks', 123)
 * await create('/api/stocks', { code: '600000' })
 * await update('/api/stocks', 123, { name: 'new' })
 * await remove('/api/stocks', 123)
 */

// 默认超时时间（毫秒），可通过环境变量 `NEXT_PUBLIC_REQUEST_TIMEOUT_MS` 覆盖
const DEFAULT_TIMEOUT_MS = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS
  ? Number.parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS, 10)
  : 10_000

let authToken: string | null = null

/**
 * Set the runtime Authorization token used by the axios instance.
 * @param {string | null} token - Bearer token or null to clear
 */
export function setAuthToken(token: string | null) {
  authToken = token
}

/**
 * Get the currently set Authorization token (if any).
 * @returns {string | null}
 */
export function getAuthToken() {
  return authToken
}

/**
 * Low-level request wrapper.
 * @template T
 * @param {AxiosRequestConfig} config - Axios request configuration
 * @returns {Promise<T>} - resolves with response data (res.data)
 * @throws {RequestError} structured error with status/data/message
 */

function createInstance(): AxiosInstance {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

  const inst = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  // 请求拦截：注入 token（如果有）
  inst.interceptors.request.use((config) => {
    const token = authToken
    if (token) {
      config.headers = config.headers || {}
      // 使用 Bearer 方案
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  })

  // 响应拦截：统一返回 data 或抛出结构化错误
  inst.interceptors.response.use(
    (res: AxiosResponse) => res,
    (err) => {
      // 让后续统一处理
      return Promise.reject(err)
    }
  )

  return inst
}

const http = createInstance()

export interface RequestError extends Error {
  status?: number
  data?: unknown
}

/**
 * Low-level request wrapper.
 * @template T
 * @param {AxiosRequestConfig} config - Axios request configuration
 * @returns {Promise<T>} - resolves with response data (res.data)
 * @throws {RequestError} structured error with status/data/message
 */
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await http.request<T>(config)
    // 当后端把真正的数据放在 data.data 时，取决于后端约定；这里优先返回 res.data
    return res.data as T
  } catch (e: any) {
    // axios error handling
    const err: RequestError = new Error()
    if (e.response) {
      err.status = e.response.status
      err.message = e.response.data?.message || e.message || 'Request failed'
      err.data = e.response.data
    } else if (e.request) {
      err.message = 'No response received from server'
    } else {
      err.message = e.message || 'Request setup error'
    }
    return Promise.reject(err)
  }
}

// 便捷方法
// 基于 RESTful 的便捷方法：支持 params、id 与 resource 风格调用
export function get<T = any>(url: string, config?: AxiosRequestConfig) {
  return request<T>({ ...(config || {}), method: 'GET', url })
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return request<T>({ ...(config || {}), method: 'POST', url, data })
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return request<T>({ ...(config || {}), method: 'PUT', url, data })
}

export function patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return request<T>({ ...(config || {}), method: 'PATCH', url, data })
}

export function del<T = any>(url: string, config?: AxiosRequestConfig) {
  return request<T>({ ...(config || {}), method: 'DELETE', url })
}

// RESTful helpers (resource-oriented)
function serializeParams(params?: Record<string, any>) {
  if (!params) return ''
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (Array.isArray(v)) {
      v.forEach((item) => usp.append(k, String(item)))
    } else if (typeof v === 'object') {
      usp.append(k, JSON.stringify(v))
    } else {
      usp.append(k, String(v))
    }
  })
  const s = usp.toString()
  return s ? `?${s}` : ''
}

function buildUrl(resource: string, id?: string | number, params?: Record<string, any>) {
  let url = resource
  if (id !== undefined && id !== null) url = `${url}/${id}`
  if (params) url += serializeParams(params)
  return url
}

// list: GET /resource?params
export function list<T = any>(resource: string, params?: Record<string, any>) {
  const url = buildUrl(resource, undefined, params)
  return get<T>(url)
}

// retrieve: GET /resource/{id}
export function retrieve<T = any>(resource: string, id: string | number, params?: Record<string, any>) {
  const url = buildUrl(resource, id, params)
  return get<T>(url)
}

// list: POST /resource
export function create<T = any>(resource: string, data?: any, params?: Record<string, any>) {
  const url = buildUrl(resource, undefined, params)
  return post<T>(url, data)
}

// update: PUT /resource/{id}
export function update<T = any>(resource: string, id: string | number, data?: any, params?: Record<string, any>) {
  const url = buildUrl(resource, id, params)
  return put<T>(url, data)
}

// remove: DELETE /resource/{id}
export function remove<T = any>(resource: string, id: string | number, params?: Record<string, any>) {
  const url = buildUrl(resource, id, params)
  return del<T>(url)
}

export default {
  request,
  get,
  post,
  put,
  del,
  setAuthToken,
  getAuthToken,
}
