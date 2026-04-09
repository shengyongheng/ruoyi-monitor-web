import request from '@/utils/request'

// 查询静态资源统计数据
export function getResourceStatistics(query) {
    return request({
        url: '/monitor-resource/resource-statistics',
        method: 'get',
        params: query
    })
}

// 静态资源会话列表
export function getResourceSessionList(query) {
    return request({
        url: '/monitor-resource/session_list',
        method: 'get',
        params: query
    })
}

// 静态资源会话列表详情
export function getResourceDetailList(query) {
    return request({
        url: '/monitor-resource/resource_detail_list',
        method: 'get',
        params: query
    })
}
