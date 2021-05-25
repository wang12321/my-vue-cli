import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken, setToken, setPreSetLocalStorage, getPreSetLocalStorage } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import apiURL from '@/services/apiURL'

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
    }
    if (!getToken()) {
      const url = window.btoa(encodeURIComponent(window.location.href))
      window.location = `${apiURL[store.state.settings.NODE_ENV].UnifiedLogin}/?request_url=${url}`
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
