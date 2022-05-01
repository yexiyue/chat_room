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

