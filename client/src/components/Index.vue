<template>
  <div>
    <list></list>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../store/store';
import List from './List.vue'
import { useRouter } from 'vue-router';
const store=useUserStore()
const router=useRouter()

</script>

<style  lang="less">
div{
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  
  .list{
    width: 300px;
    background-color: transparent;
  }
  
}
</style>