const {promisify} = require('util')
// 封装一个函数，得到一个函数，得到的函数返回值是一个promise
const figlet = promisify(require('figlet'))
const clear = require('clear')
const chalk = require('chalk')
const {resolve} = require('path')
const log = content => console.log(chalk.green(content))
const {clone} = require('./download')
const { fscreateReadStream, fscreateWriteStream } = require('./common.js')
const { run } = require('runjs')

module.exports = async () => {
    run(`npm install qiankun`,{cwd:`${resolve('./')}`})
    // qiankun
    async function qiankunFile(){
        let  qiankun =  await fscreateReadStream(`${__dirname}/../template/qiankun.txt`)
        await fscreateWriteStream(`${resolve('./')}/src/views/qiankun`,'qiankun.vue',qiankun)

        let  qiankunjs =  await fscreateReadStream(`${__dirname}/../template/qiankun.js`)
        await fscreateWriteStream(`${resolve('./')}/src/router/modules`,'qiankun.js',qiankunjs)

        let  Main =  await fscreateReadStream(`${resolve('./')}/src/main.js`)
        let  qiankunMain =  await fscreateReadStream(`${__dirname}/../template/qiankunMain.txt`)
        await fscreateWriteStream(`${resolve('./')}/src`,'main.js',Main+qiankunMain)

        let  appmain =  await fscreateReadStream(`${__dirname}/../template/appMain.txt`)
        await fscreateWriteStream(`${resolve('./')}/src/layout/components`,'AppMain.vue',appmain)
        run(`npm run lint:fix`,{cwd:`${resolve('./')}`})
        console.log('微前端接入成功')
    }
    qiankunFile()
}

