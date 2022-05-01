<template>
  <div class="list">
    <div class="card" @click="flag=!flag">
      <p>聊天列表</p>
    </div>
    <transition-group v-if="flag" enter-active-class="animate__animated animate__backInUp" leave-active-class="animate__animated animate__backOutUp">
      <div class="card" @click="MainClick">
        <p>炸天帮({{store.userList.length}})</p>
      </div>
      <div class="card" v-for="item in list" :key="item" @click="clickEvent(item)">
        <p>{{item}}</p>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import {onMounted,ref,reactive} from 'vue'
import { useUserStore } from '../store/store';
import { useWs } from '../hocks/ws';
import { useRouter } from 'vue-router';
import 'animate.css'
const flag=ref(false)
const store=useUserStore()
const router=useRouter()

const list=reactive<Set<string>>(new Set())

onMounted(()=>{
  useWs.send({
    type:'idMapWs',
    data:{
      id:sessionStorage.getItem('id')
    }
  })
  useWs.send({
    type:'getList',
    data:''
  })
  router.push({
    path:'/index/container',
    query:{
      name:'炸天帮',
      id:'all'
    }
  })
})
const MainClick=()=>{
  router.push({
    path:'/index/container',
    query:{
      name:'炸天帮',
      id:'all'
    }
  })
}
store.$subscribe(()=>{
  if(store.userList.length>0){
    store.userList.forEach(v=>{
      if(sessionStorage.getItem('id')!=v){
        router.addRoute('index',{
          path:v,
          component:()=>import('./Continue.vue')
        })
        list.add(v)
      }
    })
  }
})

const clickEvent=(v:string)=>{
  router.push({
    path:`/index/${v}`,
    query:{
      name:v,
      id:v
    }
  })
}
</script>

<style scoped lang="less">
.list{
  background-image: url('../assets/2052078.jpg');
  background-size: cover;
  background-position: top center;
  display: flex;
  flex-direction: column;
}
.card{
  width:100%;
  height: 50px;
  margin: 5px 0px;
  background-color: rgba(235, 227, 227, 0.486);
  /* backdrop-filter: blur(6px); */
  transition: .5s;
  cursor: pointer;
  &:hover{
    box-shadow: 5px 0px 2px 3px rgb(143, 230, 155);
  }
  p{
    text-align: center;
    width: 100%;
    line-height: 50px;
    font-size: 18px;
    color: white;
    font-style: italic;
  }
}
</style>