import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  // set page title
  document.title = getPageTitle(to.meta.title)
  // determine whether the user has logged in
  const hasToken = getToken()
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
