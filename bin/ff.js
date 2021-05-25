#!/usr/bin/env node
const program = require('commander')
program.version(require('../package').version)
program
    .command('init <name>')
    .description('init project')
    .action(require('../lib/init.js'))

program
    .command('add <name>')
    .description('create File')
    .action(require('../lib/add.js'))

program
    .command('temp <name>')
    .description('create File')
    .action(require('../lib/temp.js'))

program
    .command('sentry')
    .description('create File')
    .action(require('../lib/sentry.js'))

program
    .command('qiankun')
    .description('create File')
    .action(require('../lib/qiankun.js'))


program
    .command('list')
    .description('list')
    .action(()=>{
        console.log(`
        init 初始化项目
        add  初始化增删改查文件
        temp 初始化基础文件
        sentry 接入sentry
        qiankun 接入微前端
        `)
    })


program.parse(process.argv)
