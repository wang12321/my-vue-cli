import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken, setToken, setPreSetLocalStorage, getPreSetLocalStorage } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import apiURL from '@/services/apiURL'
import server from './services/server'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

function getSearchParam(name) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
  const r = window.location.search.substr(1).match(reg)
  if (r != null) {
    return decodeURIComponent(r[2])
  }
  return null
}
function getRemovedTokenInUrl() {
  const removeTokenArray = window.location.href.split('token=')
  const frontPart = removeTokenArray[0].slice(0, removeTokenArray[0].length - 1)
  const hashPart = removeTokenArray[1].split('#')[1]
  return `${frontPart}#${hashPart}`
}

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  // set page title
  document.title = getPageTitle(to.meta.title)
  // determine whether the user has logged in
  const hasToken = getToken()
  if (store.state.settings.isUnifiedLogin) {
    try {
      setPreSetLocalStorage('yes')
      if (!getPreSetLocalStorage()) {
        alert('监测到浏览器无法跨站存储信息,请关闭阻止第三方cookie或关闭阻止跨站跟踪或关闭无痕模式L')
      }
    } catch (err) {
      alert(`监测到浏览器无法跨站存储信息,请关闭阻止第三方cookie或关闭阻止跨站跟踪或关闭无痕模式L。${err}`)
    }

    if (window.location.search !== '' && getSearchParam('token')) {
      setToken('admin-token') // 为了测试先默认设置一个
      // setToken(getSearchParam('token'))
      server.defaults.headers.common['x-xq5-jwt'] = getToken() ? getToken() : '';
      window.history.replaceState({}, document.title, getRemovedTokenInUrl());
    }
    if (!getToken()) {
      const url = window.btoa(encodeURIComponent(window.location.href))
      window.location = `${apiURL[store.state.settings.NODE_ENV].UnifiedLogin}/?request_url=${url}&token_in_url=1`
      return
    }
  }
  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          //  permissionArray: [1] 表示只有超级管理员可以访问
          //  permissionArray: [1, 2] 表示只有超级管理员 和管理员可以访问
          //  permissionArray: [1, 2, 3] 表示只有超级管理员 、管理员及普通员工可以访问
          const userInfo = await store.dispatch('user/getInfo')
          const accessRoutes = await store.dispatch('permission/generateRoutes', userInfo.permission)
          await store.dispatch('user/Gamelist')
          // router.addRoutes(accessRoutes)
          router.$addRoutes(accessRoutes) // 消除重复定义name
          next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
      // 如果没有gameId 回到首页
      if (store.state.permission.gameId === '' && to.path !== '/dashboard' && store.state.settings.isGameShow) {
        next('/')
      }
      // 如果有gameId 点击首页，则清空gameId
      if (store.state.permission.gameId !== '' && to.path === '/dashboard' && store.state.settings.isGameShow) {
        store.commit('permission/SET_GameId', '')
        store.commit('permission/SET_ROUTES', store.state.permission.addRoutes)
        next('/')
      }
      // 如果有gameId 处理/:id 动态路由
      if (store.state.permission.gameId !== '' && to.path.includes(':id') && store.state.settings.isGameShow) {
        const params = {}
        params['id'] = store.state.permission.gameId
        next({ ...to, params: params })
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
