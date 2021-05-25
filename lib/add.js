const {promisify} = require('util')
// 封装一个函数，得到一个函数，得到的函数返回值是一个promise
const figlet = promisify(require('figlet'))
const clear = require('clear')
const chalk = require('chalk')
const {resolve} = require('path')
const log = content => console.log(chalk.green(content))
const {clone} = require('./download')
const { fscreateReadStream, fscreateWriteStream } = require('./common.js')

module.exports = async name => {
    console.log('resolve   : ' + resolve('./'))
    console.log('name : ' + name)
    // autoRouter
    async function addFile(){
        let  file =  await fscreateReadStream(`${__dirname}/../template/addFile.txt`)
        await fscreateWriteStream(`${resolve('./')}/src/views/autoRouter/${name}`,`${name}.vue`,file)
        console.log('新增文件成功')
    }
    addFile()
}


