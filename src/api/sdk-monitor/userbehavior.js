import request from '@/utils/request'

// 查询会话列表
export function listSessions(query) {
    return request({
        url: '/monitor-userbehavior/session_list',
        method: 'get',
        params: query
    })
}

// 查询会话详情
export function sessionsDetail(query) {
    return request({
        url: '/monitor-userbehavior/session_detail',
        method: 'get',
        params: query
    })
}

// 查询用户行为时间轴
export function getBehaviorTimeline(query) {
    return request({
        url: '/monitor-userbehavior/behavior_timeline',
        method: 'get',
        params: query
    })
}

// 查询用户行为详情
export function getBehaviorDetail(query) {
    return request({
        url: '/monitor-userbehavior/behavior_detail',
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