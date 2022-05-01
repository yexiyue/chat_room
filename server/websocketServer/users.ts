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
