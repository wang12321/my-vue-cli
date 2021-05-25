import { constantRoutes, asyncRouterMap } from '@/router'
import { getIsGameIdKey, setIsGameIdKey } from '@/utils/auth'
import defaultSettings from '@/settings'
const { isGameShow } = defaultSettings

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.permissionArray) {
        return roles.some(role => route.meta.permissionArray.includes(role))
    } else {
        return true
    }
}

// 左侧菜单排序
const compare = function(prop) {
    return function(obj1, obj2) {
        const val1 = obj1[prop]
        const val2 = obj2[prop]
        if (val1 < val2) {
            return -1
        } else if (val1 > val2) {
            return 1
        } else {
            return 0
        }
    }
}
/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
    routes = routes.sort(compare('index'))
    const res = []
    routes.forEach(route => {
        const tmp = { ...route }
        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAsyncRoutes(tmp.children, roles)
            }
            res.push(tmp)
        }
    })
    return res
}

const state = {
    routes: [],
    addRoutes: [],
    gameId: getIsGameIdKey() || '',
    isGameShow: isGameShow
}

const mutations = {
    SET_ROUTES: (state, routes) => {
        state.addRoutes = routes
        // 如果isGameShow 设置true  控制选择游戏平台才能展示菜单选项
        if (isGameShow) {
            if (state.gameId !== '') {
                state.routes = constantRoutes.concat(routes)
            } else {
                state.routes = constantRoutes
            }
        } else {
            state.routes = constantRoutes.concat(routes)
        }
    },
    SET_GameId: (state, data) => {
        state.gameId = data
        setIsGameIdKey(data)
    }
}

const actions = {
    // 根据权限生成动态路由
    generateRoutes({ commit }, roles) {
        return new Promise(resolve => {
            const accessedRoutes = filterAsyncRoutes(asyncRouterMap, roles)
            commit('SET_ROUTES', accessedRoutes)
            resolve(accessedRoutes)
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}