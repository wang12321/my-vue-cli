const {promisify} = require('util')
// 封装一个函数，得到一个函数，得到的函数返回值是一个promise
const figlet = promisify(require('figlet'))
const clear = require('clear')
const chalk = require('chalk')
const log = content => console.log(chalk.green(content))
const {clone} = require('./download')

module.exports = async name => {
    //打印页面
    clear()
    const data = await figlet('zonst welcome')
    log(data)
    log('🚀创建项目' + name)
    await clone('direct:https://git.xq5.com/qipai-demo/vue-admin-zonst#node-cli',name)
}


