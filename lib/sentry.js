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
    console.log('resolve   : ' + resolve('./'))
    run(`npm install @sentry/browser`,{cwd:`${resolve('./')}`})
    run(`npm install @sentry/integrations`,{cwd:`${resolve('./')}`})

    async function sentryFile(){
        let  Main =  await fscreateReadStream(`${resolve('./')}/src/main.js`)
        let  sentryMain = `
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

/**
 * Sentry 接入平台配置 1、老环境 2、省外环境
 */
if (window.location.host === 'xxxxxx.xq668.com') {
  Sentry.init({
    dsn: 'https://xxxxxxxxxx.xq556.com/46',
    integrations: [
      new Integrations.Vue({
        Vue,
        attachProps: true
      })
    ]
  })
} else if (window.location.host === 'xxxxx.xq5.com') {
  Sentry.init({
    dsn: 'https://xxxxxxxxxxxxxxxxx.xq556.com/45',
    integrations: [
      new Integrations.Vue({
        Vue,
        attachProps: true
      })
    ]
  })
}
    `
        await fscreateWriteStream(`${resolve('./')}/src`,'main.js',Main+sentryMain)

        // server.js

        let  serverS =  await fscreateReadStream(`${resolve('./')}/src/services/server.js`)
        let Sentrystr1 = 'Sentry.configureScope((scope) => {\n        scope.setTag(\'errno\', \`${response.data.errmsg}\`)\n        scope.setLevel(\'warning\')\n        scope.setExtra(\'setExtra\', response.config)\n        scope.setExtra(\'localStorage\', window.localStorage ? window.localStorage.valueOf() : \'localStorage无法获得\')\n        scope.setExtra(\'sessionStorage\', window.sessionStorage ? window.sessionStorage.valueOf() : \'sessionStorage无法获得\')\n      })\n      Sentry.captureMessage(\`errno不为0 ${response.data.errmsg} ${response.config.url}\`, \'info\')'
        let Sentrystr2 = 'Sentry.configureScope((scope) => {\n      scope.setTag(\`${error.response.status}\`, \`${error.response.data.errmsg}\`)\n      scope.setLevel(\'warning\')\n      scope.setExtra(\'setExtra\', error)\n      scope.setExtra(\'localStorage\', window.localStorage ? window.localStorage.valueOf() : \'localStorage无法获得\')\n      scope.setExtra(\'sessionStorage\', window.sessionStorage ? window.sessionStorage.valueOf() : \'sessionStorage无法获得\')\n    })\n    Sentry.captureMessage(\`${error.response.status}${error.response.data.errmsg}${error.config.url}\`, \'info\')'

        let serverF = serverS

        let serverone = `
        ${serverF.substring(0, serverF.indexOf("const service"))}
        import * as Sentry from '@sentry/browser'
        ${serverF.substring(serverF.indexOf("const service"), serverF.length)}
            `
        // sentry预留位置1
        let servertwo =`
         ${serverone.substring(0, serverone.indexOf("// sentry预留位置1 ---- 请不要删除"))}
        ${Sentrystr1}
        ${serverone.substring(serverone.indexOf("// sentry预留位置1 ---- 请不要删除"), serverone.length)}
        `
        // sentry预留位置2
        let serverthree =`
         ${servertwo.substring(0, servertwo.indexOf("// sentry预留位置2 ---- 请不要删除"))}
        ${Sentrystr2}
        ${servertwo.substring(servertwo.indexOf("// sentry预留位置2 ---- 请不要删除"), servertwo.length)}
        `

        await fscreateWriteStream(`${resolve('./')}/src/services`,'server.js',serverthree)
        run(`npm run lint:fix`,{cwd:`${resolve('./')}`})
        console.log('sentry接入成功')
    }
    sentryFile()
}


