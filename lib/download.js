const {promisify} = require('util')
const download = promisify(require('download-git-repo'))
const inquirer = require('inquirer')
const fs = require('fs')
const handlebars = require('handlebars')
const {resolve} = require('path')
const path = require('path')
const { run } = require('runjs')
const { fscreateReadStream, fscreateWriteStream } = require('./common.js')

module.exports.clone = async (repo,desc)=>{

    console.log('__dirname : ' + __dirname)
    console.log('resolve   : ' + resolve('./'))

    const ora = require('ora')
    const process = ora(`下载...${repo}`)
    process.start()
    await download(repo,desc,{clone: true}, err => {
        console.log(err?'err':'success')
        console.log(err)
        process.succeed()
        inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: '请输入项目名称'
        },{
            type: 'input',
            name: 'description',
            message: '请输入项目简介'
        },{
            type: 'input',
            name: 'author',
            message: '请输入作者名称'
        }]).then((answers)=>{
            console.log(answers)
            const packagePath = `${desc}/package.json`
            const packageContent = fs.readFileSync(packagePath,'utf8')
            const packageResult =  handlebars.compile(packageContent)(answers)
            fs.writeFileSync(packagePath,packageResult)

            inquirer.prompt([{
                type: 'confirm',
                name: 'isUnifiedLogin',
                message: '请输入是否需要统一登入:',
                default: false,
            },{
                type: 'confirm',
                name: 'isGameShow',
                message: '请输入是否需要展示游戏平台:',
                default: false,
            },{
                type: 'confirm',
                name: 'isAPIRouter',
                message: '请输入是否异步请求Router:',
                default: false,
            },{
                type: 'confirm',
                name: 'isQianKun',
                message: '请输入是否需要微前端:',
                default: false,
            }]).then((answers)=>{
                // permission.js
                async function File(){
                    async function permissionFile(){

                        if(answers.isUnifiedLogin && answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/permission.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src`,'permission.js',permission)
                        }
                        if(answers.isUnifiedLogin && !answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/permissionLogin.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src`,'permission.js',permission)
                        }
                        if(!answers.isUnifiedLogin && answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/permissionGame.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src`,'permission.js',permission)
                        }

                    }
                    await permissionFile()

                    // dashboard/index.vue
                    async function dashboardFile(){

                        if(answers.isGameShow){
                            let  gameShow =  await fscreateReadStream(`${__dirname}/../template/indexGame.txt`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/views/dashboard`,'index.vue',gameShow)
                        }
                    }
                    await dashboardFile()

                    // login/index.vue
                    async function loginFile(){
                        if(answers.isUnifiedLogin){
                            let  login =  await fscreateReadStream(`${__dirname}/../template/login.txt`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/views/login`,'index.vue',login)
                        }
                    }
                    await loginFile()

                    // nabbar.vue
                    async function nabbarFile(){

                        if(answers.isGameShow && answers.isUnifiedLogin){
                            let  navbar =  await fscreateReadStream(`${__dirname}/../template/Navbar.txt`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/layout/components`,'Navbar.vue',navbar)
                        }
                        if(answers.isGameShow && !answers.isUnifiedLogin){
                            let  navbar =  await fscreateReadStream(`${__dirname}/../template/NavbarGame.txt`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/layout/components`,'Navbar.vue',navbar)
                        }
                        if(!answers.isGameShow && answers.isUnifiedLogin){
                            let  navbar =  await fscreateReadStream(`${__dirname}/../template/NavbarLogin.txt`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/layout/components`,'Navbar.vue',navbar)
                        }
                    }
                    await nabbarFile()

                    // store/permission.js
                    async function permissionRouterFile(){
                        if(answers.isAPIRouter && answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/permissionState.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/store/modules`,'permission.js',permission)
                        }
                        if(!answers.isAPIRouter && answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/permissionStateGame.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/store/modules`,'permission.js',permission)
                        }
                        if(answers.isAPIRouter && !answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/permissionStateRouterApi.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/store/modules`,'permission.js',permission)
                        }
                    }
                    await permissionRouterFile()

                    // router/index.js
                    async function routerFile(){
                        if(answers.isAPIRouter && answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/router.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/router`,'index.js',permission)
                        }
                        if(!answers.isAPIRouter && answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/routerGame.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/router`,'index.js',permission)
                        }
                        if(answers.isAPIRouter && !answers.isGameShow){
                            let  permission =  await fscreateReadStream(`${__dirname}/../template/routerApi.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/router`,'index.js',permission)
                        }
                    }
                    await routerFile()

                    // qiankun
                    async function qiankunFile(){
                        if(answers.isQianKun){
                            let  qiankun =  await fscreateReadStream(`${__dirname}/../template/qiankun.txt`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/views/qiankun`,'qiankun.vue',qiankun)

                            let  qiankunjs =  await fscreateReadStream(`${__dirname}/../template/qiankun.js`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/router/modules`,'qiankun.js',qiankunjs)

                            let  Main =  await fscreateReadStream(`${resolve('./')}/${desc}/src/main.js`)
                            let  qiankunMain =  await fscreateReadStream(`${__dirname}/../template/qiankunMain.txt`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src`,'main.js',Main+qiankunMain)

                            let  appmain =  await fscreateReadStream(`${__dirname}/../template/appMain.txt`)
                            await fscreateWriteStream(`${resolve('./')}/${desc}/src/layout/components`,'AppMain.vue',appmain)
                        }
                    }
                    await qiankunFile()

                    // dashboard/index.vue
                    async function settingFile(){
                        let  setting =  await fscreateReadStream(`${resolve('./')}/${desc}/src/settings.js`)
                        await fscreateWriteStream(`${resolve('./')}/${desc}/src`,'settings.js',setting.substring(0,setting.indexOf('isSwitchEnvironment')) +`${answers.isAPIRouter?(`isAPIRouter: ${answers.isAPIRouter}, // 是否接口返回`):''}
                      ${answers.isUnifiedLogin?`isUnifiedLogin: ${answers.isUnifiedLogin}, // 是否统一登入`:''}
                      ${answers.isGameShow?`isGameShow: ${answers.isGameShow}, // 是否展示游戏平台`:''}                    
                      ${setting.substring(setting.indexOf('isSwitchEnvironment'),setting.length)}`
                        )

                        let  settings =  await fscreateReadStream(`${resolve('./')}/${desc}/src/store/modules/settings.js`)
                        await fscreateWriteStream(`${resolve('./')}/${desc}/src/store/modules`,'settings.js',settings.substring(0,settings.indexOf('isSwitchEnvironment')) +`${answers.isAPIRouter?(`isAPIRouter: defaultSettings.isAPIRouter, // 是否接口返回`):''}
                      ${answers.isUnifiedLogin?`isUnifiedLogin: defaultSettings.isUnifiedLogin, // 是否统一登入`:''}
                      ${answers.isGameShow?`isGameShow: defaultSettings.isGameShow, // 是否展示游戏平台`:''}   
                      ${settings.substring(settings.indexOf('isSwitchEnvironment'),settings.length)}`
                        )

                    }
                    await settingFile()
                    console.log('成功')

                    run(`npm install`,{cwd:`${resolve('./')}/${desc}`})

                    // 添加qiankun npm
                    if(answers.isQianKun){
                        run(`npm install qiankun`,{cwd:`${resolve('./')}/${desc}`})
                    }
                    // 格式化文件
                    run(`npm run lint:fix`,{cwd:`${resolve('./')}/${desc}`})
                    run(`npm run dev`,{cwd:`${resolve('./')}/${desc}`})
                }

                File()

            })
        })
    })
}

// fs.readFile(`${__dirname}/../template/permission.js`, null, function(error, data) {
//     if(error){
//         console.log('读取doNotChangeIt.css文件出错了'+error)
//     }else {
//         cssTemplet=data.toString()
//         console.log('读取doNotChangeIt.css==cssTemplet:'+cssTemplet)
//         console.log(desc)
//         async function creatHtml(){
//             await dirExists(`${resolve('./')}/${desc}/workspace`);
//             fs.writeFile(`${resolve('./')}/${desc}/workspace/pppp.js`, cssTemplet, 'utf8', err => {
//                 if (err) console.log(err)
//                 console.log('\n')
//                 console.log(`在${resolve('./')}/workspace下成功新建了ppp.js\n`)
//             })
//
//         }
//         creatHtml()
//     }
// })
