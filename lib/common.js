const {promisify} = require('util')
const fs = require('fs')
const {resolve} = require('path')
const path = require('path')

/**
 * 读取文件信息
 * @param path 文件路径
 * @returns {Promise<unknown>}
 */
function fscreateReadStream(path) {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(path,{encoding:"utf-8"})
        stream.on("data",chunk=>{
            resolve(chunk)
        })
    })
}

/**
 * 写入文件信息
 * @param path 文件路径
 * @param fileName  文件名
 * @param chunk  写入文件
 * @returns {Promise<unknown>}
 */
async function fscreateWriteStream(path,fileName,chunk) {
    await dirExists(path);
    return new Promise((resolve, reject) => {
        let ws=fs.createWriteStream(path+'/'+fileName,{
        });
        ws.write(chunk,err=>{
            resolve(err)
        });
    })
}

/**
 * 读取路径信息
 * @param {string} path 路径
 */
function getStat(path){
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if(err){
                resolve(false);
            }else{
                resolve(stats);
            }
        })
    })
}

/**
 * 创建路径
 * @param {string} dir 路径
 */
function mkdir(dir){
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, err => {
            if(err){
                resolve(false);
            }else{
                resolve(true);
            }
        })
    })
}

/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
async function dirExists(dir){
    let isExists = await getStat(dir);
    //如果该路径且不是文件，返回true
    if(isExists && isExists.isDirectory()){
        return true;
    }else if(isExists){     //如果该路径存在但是文件，返回false
        return false;
    }
    //如果该路径不存在
    let tempDir = path.parse(dir).dir;      //拿到上级路径
    //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
    let status = await dirExists(tempDir);
    let mkdirStatus;
    if(status){
        mkdirStatus = await mkdir(dir);
    }
    return mkdirStatus;
}

module.exports = {
    fscreateReadStream,
    fscreateWriteStream
}
