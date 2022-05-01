import Router from 'koa-router'
import jwt from 'jsonwebtoken'
import { wss } from '../websocketServer/wss'
export const router=new Router()

router.get('/',(ctx,next)=>{
  
  ctx.body={
    msg:'登录成功'
  }
})

router.post('/login',(ctx,next)=>{
  const user=ctx.request.body
  try {
    const token=jwt.sign(user.username,"123456")
    ctx.status=201
    ctx.body={
      code:201,
      token,
      msg:"请求token成功"
    }
  } catch (error) {
    ctx.status=501;
    ctx.body={
      code:501,
      msg:"服务器发生未知错误"
    }
  }
})