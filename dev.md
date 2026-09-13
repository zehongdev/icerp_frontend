# 开发日志

## 上传新版本流程

    1. 发布前修改版本号 package.json version
    2. npm run dist:win 打包Windows系统使用的exe安装包
    3. 打包后的文件目录为release 。修改latest.yml 填写更新日志releaseNotes:  下面的每一行必须缩进两个空格 其他字段不要改动 version files sha512 size 等
    4. 3个增量更新包 release/xx x.x.x.exe  x.x.x.exe.blockmap  latest.yml
       推送到服务端 scp -i "$env:USERPROFILE\Downloads\nodejs.pem" ".\release\ICERP Setup 0.0.2.exe" ".\release\ICERP Setup 0.0.2.exe.blockmap" ".\release\latest.yml" "root@134.175.190.35:/var/www/icerp-updates/"
       "$env:USERPROFILE\Downloads\nodejs.pem" 为本地密钥
       跟随3个增量更新包
       最后为远程IP地址 以及目录
    5. 客户端检查更新，后台下载，安装。更新完成

## react热更新
