<template>
  <div>
    <div class="login">
      <p><span>登录</span></p>
      <p><span>用户名：</span><input type="text" placeholder="请输入用户名" v-model="user.username"></p>
      <p><span>密码：</span><input type="password" placeholder="请输入密码" v-model="user.password"></p>
      
      <p><button @click="btnClick">登录</button><button @click="router.push('/register')">注册</button></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive } from 'vue'
import {useRouter} from 'vue-router'
import { useUserStore } from '../store/store';
import { useWs } from '../hocks/ws';
const router=useRouter()
const store=useUserStore()
const user=reactive<User>({
  username:'',
  password:''
})

const btnClick=async()=>{
  let result:User|undefined=undefined
  if(user.username.trim().length!=0){
    result=await store.getUser(user.username) as User
  }else{
    alert('用户名不能为空')
    return
  }
  if(!result?.username){
    alert('该用户未注册')
    return;
  }
  if(result?.password==user.password){
    const headers=new Headers({
      "Content-Type":"application/json"
    })
    sessionStorage.setItem('id',user.username)
    try {
      const data=await fetch('http://192.168.10.18:8000/login',{
        method:'post',
        body:JSON.stringify(result),
        headers,
      })
      const res=await data.json()
      localStorage.setItem("token",res.token)
    } catch (error) {
      console.log(error)
    }
    router.push('/index')
  }else{
    alert("密码错误")
  }

  useWs.send({
    type:'getList',
    data:''
  })
}

</script>

<style scoped lang="less">
@opacity:0.4;

div{
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("../assets/2052108.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  .login{
    width: 350px;
    height: 200px;
    display: flex;
    border-radius: 25px;
    flex-direction: column;
    justify-content: space-around;
    backdrop-filter: blur(4px);
    background-image: linear-gradient(to right,rgba(157, 255, 0,@opacity),rgba(50, 224, 210,@opacity),rgba(235, 153, 47,@opacity));
    /* transform: scale(1.2); */
    p{
      width: 350px;
      text-align: center;
      color:rgba(78, 38, 224, 0.945);
      
      input{
        outline: none;
        border: 1px solid #fff;
        background-color: transparent;
        border-radius: 10px;
        transition: 0.5s;
        color: rgb(32, 88, 243);
        padding-left: 6px;
        &:hover{
          /* background-color: rgb(32, 88, 243); */
          color: #fff;
          transform: scale(110%,110%);
        }
        &::placeholder{
          color: rgb(194, 125, 46);
        }
      }
    }
    & :nth-child(3){
      padding-left: 15px;
    }

    button{
      width:100px;
      height: 35px;
      outline: none;
      border: 1px solid transparent;
      border-radius: 35px;
      background-image: linear-gradient(45deg,#3eb96d 70%,rgba(255, 255, 255) 30%,#3eb96d);
      background-size: 200% 100%;
      background-position: 0% 100%;
      transition: 1s;
      margin: 10px;
      &:hover{
        background-position: 200% 100%;
        box-shadow: 0px 0px 3px 2px #fff;
      }
    }

    & button:last-child{
      background-image: linear-gradient(45deg,#368beb 70%,rgba(255, 255, 255) 30%,#368beb);
    }
  }
}

</style>