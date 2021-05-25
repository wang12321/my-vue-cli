import { constantRoutes, asyncRouterMap, routerMaps, ApiRouterMap } from '@/router'
import defaultSettings from '@/settings'
import api from '@/services/api'
const { isAPIRouter } = defaultSettings

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

// 映射服务器返回菜单与本地component
function generateAsyncRouter(serverRouterMap, children = false) {
    return serverRouterMap.map(item => {
        const isParent = item.children && item.children.length > 0
        const parent = generateRouter(item, isParent, children)
        if (isParent) {
            parent.children = generateAsyncRouter(item.children, true)
        }
        return parent
    })
}

const generateRouter = (item, isParent, children) => ({
    path: isParent ? `/${item.url}` : item.url || '',
    name: isParent ? 'p' + item.url : item.url || '',
    alwaysShow: false,
    meta: { title: item.menuName, icon: item.icon, id: item.menuID, newTime: item.newTime ? new Date(item.newTime) : new Date(), noCache: false },
    component: isParent && !children ? routerMaps['Layout'] : routerMaps[item.url.indexOf('/:id') > -1 ? item.url.substring(0, item.url.length - 4) : item.url]
})

const state = {
    routes: [],
    addRoutes: [],
}

const mutations = {
    SET_ROUTES: (state, routes) => {
        state.addRoutes = routes
        // 如果isGameShow 设置true  控制选择游戏平台才能展示菜单选项
        state.routes = constantRoutes.concat(routes)
    },
}

const actions = {
    // 根据权限生成动态路由
    generateRoutes({ commit }, roles) {
        return new Promise(resolve => {
            let accessedRoutes
            if (isAPIRouter) {
                const { getPageMenu } = api.user
                // 异步获取侧边栏数据
                getPageMenu({}).then(res => {
                    console.log(res)
                    if (res && res.code.toString() === '200') {
                        const data = res.data != null ? res.data : []
                        accessedRoutes = generateAsyncRouter(data).concat(filterAsyncRoutes(ApiRouterMap, roles))
                        commit('SET_ROUTES', accessedRoutes)
                        resolve(accessedRoutes)
                    }
                })
            } else {
                accessedRoutes = filterAsyncRoutes(asyncRouterMap, roles)
                commit('SET_ROUTES', accessedRoutes)
                resolve(accessedRoutes)
            }
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
