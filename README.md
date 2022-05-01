# Chat Room

## 一，背景

做个demo练练手，纯自己思考，包括websocket的封装，indexedDB的封装。

做练习的过程中，发现平时学着感觉容易，但实际过程中并不是那么简单，另外框架的封装真的能提高效率，我在封装websocket前后端就用了一天多。造轮子的过程中各种动脑，经过这几天的练习，感觉头都快秃了。

## 二，简介

这个demo前后端全由个人开发，登录功能用后端koa提供接口，使用jwt鉴权，前端用fetch请求接口，聊天列表用了动态路由。用户之间消息前端通过原生webSocket实现，后端使用ws模块实现。支持群发和私聊。

发现的不足：

1.没能完美结合koa与ws，感觉他们之间很分散。

2.fetch没能实现请求拦截添加鉴权请求头

3.用户只有双方都在同一频道才能稳定通信，显得流程

4.对ws开发流程还不是很了解，纯自摸索

5.首次进入聊天界面不会立即加载消息记录，必须发送一次消息才可见

6.以上缺陷都没去改进，感觉还是有所欠缺，需要在多学学



## 三.下面是使用截图

1.登录功能

<video src="C:/Users/%E6%A2%A6%E5%9B%9E%E5%8D%83%E8%BD%AC%E7%99%BD%E9%A6%96/Documents/WeChat%20Files/wxid_4m0isnt7uaf622/FileStorage/Video/2022-05/39ef4a071204e349e581ca46112da4e0.mp4"></video>



2.聊天列表

![image-20220501213359285](https://s2.loli.net/2022/05/01/pAyzIZn9VYhXwH7.png)



3.不同的角度的聊天记录

![image-20220501213536933](https://s2.loli.net/2022/05/01/KrEDNak5qmXngVY.png)



![image-20220501213554717](https://s2.loli.net/2022/05/01/FPwHag9ArqZYcvd.png)





## 四，核心模块

### 1.对ws的封装

```typescript
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

```

### 2.使用

```typescript
import {wss} from './wss'
type Data={
  type:string,
  data:any
}
wss.addCustomEvent('userList',(ev:Data)=>{
  (ev.data as []).forEach((v:{username:string,password:string}) => {
    wss.userList.add(v.username)
  });
})

wss.addCustomEvent('idMapWs',(ev:Data,ws:any)=>{
  //通过id映射
  if(!wss.myClients.has(ev.data.id)){
    wss.myClients.set(ev.data.id,ws)
  }
})

wss.addCustomEvent('getList',(ev:Data,ws)=>{
  const list:string[]=[];
  for(let i of wss.myClients.keys()){
    list.push(i)
  }
  wss.myClients.forEach((v)=>{
    v.send(JSON.stringify({
      type:'getList',
      data:list
    }))
    console.log(JSON.stringify({
      type:'getList',
      data:list
    }))
  })
})

wss.addCustomEvent('sendMsg',(ev:Data,ws)=>{
  const data=ev.data
  const {targetId,whoSendId}=data
  if(targetId=='all'){
    wss.myClients.forEach((v,k)=>{
      if(k!=whoSendId){
        v.send(JSON.stringify({
          type:'receiveMsg',
          data
        }))
      }
    })
  }else{
    wss.myClients.get(targetId)?.send(JSON.stringify({
      type:'receiveMsg',
      data
    }))
  }
  console.log(ev)
})

```



### 3.前端对webSocket的简单封装

```typescript
type Callback={
  (data:{type:string,data:any}):void
}
type Fn={
  (ev:MessageEvent<any>):Callback|void
}
class WS{
  public ws:WebSocket;
  public cbList:Fn[]=[]
  constructor(){
    this.ws=new WebSocket('ws://192.168.10.18:8000')
    this.init()
  }
  private init(){
    this.ws.onopen=()=>{
      console.log('打开连接')
    }
    this.ws.onmessage=(ev)=>{
      if(this.cbList.length>0){
        this.cbList.forEach(fn=>fn(ev))
      }
    }
    this.ws.onerror=()=>{
      console.log('websocket出现错误')
    }
    this.ws.onclose=()=>{
      console.log('关闭连接')
    }
    
  }

  public addEvent(eventName:string,cb:Callback){
    const fn=(ev:MessageEvent<any>)=>{
      const data=JSON.parse(ev.data)
      if(data.type==eventName){
        return cb(data)
      }
    }
    this.cbList.push(fn)
  }

  public send(data:Data){
    if(this.ws.readyState==this.ws.OPEN){
      this.ws.send(JSON.stringify(data))
    }else{
      setTimeout(() => {
        this.ws.send(JSON.stringify(data))
      }, 200);
    }
  }
}
const useWs=new WS()
export {useWs}
```



### 4.数据展示同时也是最难的部分

```vue
<template>
  <div class="window">
    <header><p>{{route.query.name}}</p></header>
    <div class="container">
      <Show-vue v-if="route.query.id=='all'">
        <template #default>
          <span v-for="item in store.msgList" :key="item.dateTime" :class="[item.whoSendId==route.query.id?'right':'']">
            <div>{{item.whoSendId}}</div>
            {{item.msg}}
          </span>
        </template>
      </Show-vue>
      <Show-vue v-else>
        <template #default>
          <span v-for="item in store.msgList" :key="item.dateTime" :class="[item.whoSendId==myId?'right':'']">
            <div>{{item.whoSendId}}</div>
            {{item.msg}}
          </span>
        </template>
      </Show-vue>
    </div>
    <footer>
      <p><input type="text" v-model="msg">
      <button @click="sendMsg(route.query.id)">发送</button></p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useWs } from '../hocks/ws';
import { useUserStore } from '../store/store';
import {ref,toRaw} from 'vue'
import ShowVue from './Show.vue';
const route=useRoute()
const store=useUserStore()

const myId:string=sessionStorage.getItem('id') as string

const msg=ref('')
const sendMsg=(id:string)=>{
  const data:MsgData={
      whoSendId:myId,
      targetId:id,
      msg:msg.value,
      dateTime:String(new Date())
  }
  useWs.send({
    type:'sendMsg',
    data:data
  })
  store.msgList.push(data)
  /* console.log(toRaw(data)) */
  /* console.log(store.msgList) */
  msg.value=''
}

/* store.$subscribe(()=>{
  store.msgList.forEach(v=>{
    const list:Set<MsgData>=new Set()
    if((v.whoSendId==myId && v.targetId==route.query.id) || (v.whoSendId==route.query.id && v.targetId==myId) ){
      if(store.pTp.has([myId,route.query.id])){
        store.pTp.get([myId,route.query.id])?.add(v)
      }else{
        
        list.add(v)
        store.pTp.set([myId,route.query.id],list)
      }
    }
  })
  console.log(store.pTp)
}) */
</script>

<style lang="less">


.window{
    flex: 1;
    display: flex;
    flex-direction: column;
    background-image: url("../assets/2054297.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    header,footer{
      height: 15vh;
      width: 100%;
      backdrop-filter: blur(6px);
      background-color: rgba(252, 250, 250, 0.219);
      color: #fff;
    }
    header{
      height: 55px;
      background-image: linear-gradient(45deg,rgba(255, 0, 0, 0.5),rgba(0, 225, 255, 0.5),rgba(68, 240, 52, 0.5),rgba(255, 0, 0, 0.5));
      background-size: 200% 100%;
      background-position: -100% 100%;
      animation: headerMove 5s  infinite  ease-in-out;
      @keyframes headerMove{
        0%{
          background-position: -100% 100%;
        }
        100%{
          background-position: 100% 100%;
        }
      }
      p{
        height: 55vh;
        text-align: center;
        font-size: 22px;
        line-height: 55px;
      }
    }

    footer{
      p{
        margin-top: 15px;
      }
      input{
        height: 35px;
        width: 500px;
        outline: none;
        background-color: transparent;
        border: 1px solid #fff;
        font-size: 22px;
        margin-left: 5px;
        transition: .5s;
        &:hover{
          box-shadow: 0px 0px 2px 2px #fff;
        }
      }
      button{
        height: 35px;
        width: 100px;
        margin-left: 20px;
        border-radius: 25px;
        outline: none;
        border: 1px solid #fff;
        background-color: rgba(77, 221, 226, 0.685);
        color: white;
        transition: .5s;
        cursor: pointer;
        /* letter-spacing: 5px; */
        &:hover{
          box-shadow: 0px 0px 5px 2px #fff;
          background-color: rgba(38, 114, 230, 0.774);
        }
      }
    }
    .container{
      display: flex;
      width: 100%;
      flex-direction: column;
      overflow: auto;
      span{
        display: inline-block;
        /* color: white; */
        height: 26px;
        line-height: 26px;
        margin: 5px;
        padding: 0 5px;
        background-color: rgba(210, 235, 230, 0.671);
        border-radius: 10px;
        backdrop-filter: blur(6px);
        div{
          display: inline;
          height: 26px;
          font-size: 18px;
          line-height: 26px;
          /* margin: 5px; */
          margin-right: 10px;
          padding: 0 5px;
          background-color: rgba(77, 204, 130, 0.692);
          border-radius: 26px;
        }
      }
      align-items: flex-start;
    }
  }

  .right{
    align-self: flex-end;
  }
</style>
```



五，完整项目请看GitHub

[yexiyue/chat_room: 基于indexedDB+vue+ts+pinia+websocket+koa的自己做练习的demo (github.com)](https://github.com/yexiyue/chat_room)

