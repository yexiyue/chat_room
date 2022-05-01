import { Context, Next } from "koa";
import jwt from 'jsonwebtoken'
export function jwtVerify(ctx:Context,next:Next){
  try {
    //只给/login放权
    if(ctx.path!='/login'){
      jwt.verify(ctx.request.header.authorization as string,"123456")
    }
    next()
  } catch (error) {
    ctx.status=401;
    ctx.body={
      code:401,
      msg:'客户端鉴权失败。'
    }
  }
}