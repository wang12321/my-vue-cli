import Layout from '@/layout'

export default {
    path: '/app',
    component: Layout,
    alwaysShow: true,
    meta: { title: '微前端',
        icon: 'tree',
        permissionArray: [1, 2, 3]
    },
    children: [{
        path: '/app/vue',
        name: 'AppOne',
        meta: {
            title: 'appvue',
            icon: 'tree',
            permissionArray: [1, 2, 3] // 表示只有超级管理员可以访问
        },
        component: () => import('@/views/qiankun/qiankun.vue')
    }]
}
