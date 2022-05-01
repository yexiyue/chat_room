<template>
  <div>
    <router-view #default="{Component,route}">
      <transition :enter-active-class="route.meta.animation">
        <keep-alive>
          <component :is="Component" :key="route.name"></component>
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import 'animate.css'
import { onMounted ,toRaw,onBeforeMount} from 'vue';
import { useUserStore } from './store/store';
import { useWs } from './hocks/ws';

const store=useUserStore()

//初始化列表
onMounted(()=>{
  store.getUserList()
  store.initMsgList()
  //绑定诸多事件
  useWs.addEvent('getList',(data)=>{
    store.userList=data.data
  })

  useWs.addEvent('receiveMsg',(data)=>{
    store.msgList.push(data.data)
  })
})

//把本地用户发送到服务端
/* const test=useWs */
store.$subscribe(()=>{
  useWs.send({
    type:'userList',
    data:toRaw(store.users)
  })
  if(store.msgList.length!=0){
    store.msgList.forEach(v=>{
      store.addMsg(toRaw(v))
      /* console.log(v) */
    })
  }
})

</script>

<style lang="less">
*{
  margin: 0;
  padding: 0;
  font-size: 16px;
}
a{
  text-decoration: none;
  color: black;
}
ul{
  list-style: none;
}
#app{
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
button{
  cursor: pointer;
}
</style>
