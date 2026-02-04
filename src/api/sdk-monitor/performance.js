import request from '@/utils/request'

// 获取性能指标聚合数据
export function getPerformanceMetricsAgg(query) {
  return request({
    url: '/monitor-performance/metrics_agg',
    method: 'get',
    params: query
  })
}

// 新增参数配置
export function addConfig(data) {
  return request({
    url: '/system/config',
    method: 'post',
    data: data
  })
}