import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import Application from 'koa'
type Data = {
  type: string
  data: any
}
type Callback = {
  (ev: any, ws?: WebSocket): void
}
type Fn = {
  (ev: any, ws: any): Callback | void
}
class CreateWss {
  public wss?: WebSocketServer = undefined
  public server?: http.Server = undefined
  public userList: Set<string> = new Set()
  public myClients: Map<string, WebSocket> = new Map()
  public customEventList: Map<string, Fn> = new Map()
  public init(app: Application) {
    this.server = http.createServer(app.callback())
    this.wss = new WebSocketServer({ server: this.server })

    this.wss.on('connection', (ws) => {
      ws.on('message', (ev) => {
        if (this.customEventList.size > 0) {
          this.customEventList.forEach((fn) => fn(ev, ws))
        }
      })

      ws.on('close', () => {
        console.log('客户端断开连接')
        const list: string[] = []
        const old=wss.myClients
        wss.myClients.clear()
        for (let [i,v] of old) {
          if(v!=ws){
            list.push(i)
            wss.myClients.set(i,v)
          }
          console.log(i)
        }
        wss.myClients.forEach((v) => {
          v.send(
            JSON.stringify({
              type: 'getList',
              data: list,
            })
          )
        })
        console.log('******close',list)
      })
    })

    this.wss.on('error', (e) => {
      console.log(e)
    })

    this.wss.on('close', () => {
      console.log('服务器关闭')
    })
  }

  //添加自定义事件
  public addCustomEvent(eventName: string, cb: Callback) {
    const fn: Fn = (ev, ws) => {
      const data: Data = JSON.parse(ev.toString())
      if (data.type == eventName) {
        return cb(data, ws)
      }
    }
    if (!this.customEventList.has(eventName)) {
      this.customEventList.set(eventName, fn)
      /* console.log(eventName,this.customEventList) */
    }
  }
}

export const wss = new CreateWss()
