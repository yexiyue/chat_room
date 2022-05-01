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