import koa, { HttpError } from 'koa'
import koaBody from 'koa-body'
import path from 'path'
import koaStatic from 'koa-static'
import { router } from './router/router'
import { jwtVerify } from './middleware/jwtVerify'
import cors from 'koa-cors'
import { wss } from './websocketServer/wss'
import './websocketServer/users'
const app=new koa()
//使用koa-body解析
app.use(koaBody({
  json:true,
  multipart:true,
  formidable:{
    uploadDir:path.join(__dirname,'public','upload')
  }
}))
//静态文件服务
app.use(koaStatic(path.join(__dirname,'public')))
app.use(cors())
app.use(jwtVerify)
app.use(router.routes())

wss.init(app)

wss.server?.listen(8000,()=>{
  console.log('服务已经启动 http://192.168.10.18:8000/login\nws:192.168.10.18:8000')
})














