import { IDBClass } from './../IDB/main'
import { defineStore } from 'pinia'

const db = new IDBClass({
  databaseName: 'chatroom',
  objectStores: [
    {
      objectStoreName: 'users',
      objectStoreOptions: {
        keyPath: 'username',
        autoIncrement: true,
      },
    },
    {
      objectStoreName: 'msgList',
      objectStoreOptions: {
        keyPath: 'dateTime',
      },
      objectStoreIndex: [
        {
          name: 'targetId',
          keyPath: 'targetId',
          options: {
            unique: false,
          },
        },
        {
          name: 'whoSendId',
          keyPath: 'whoSendId',
          options: {
            unique: false,
          },
        }
      ],
    },
  ],
})

export const useUserStore = defineStore('user', {
  state: () => ({
    users: <User[]>[],
    userList: <string[]>[],
    msgList: <MsgData[]>[],
  }),
  getters: {},
  actions: {
    async getUserList() {
      this.users = (await db.findAll('users')) as User[]
    },
    async addUser(data: User, storeName: string = 'users'): Promise<boolean> {
      try {
        await db.add(storeName, data)
        return true
      } catch (error) {
        return false
      }
    },
    async getUser(userName: string, storeName: string = 'users') {
      try {
        const result = await db.get(storeName, userName)
        return result
      } catch (error) {
        return false
      }
    },
    async fetch(input: RequestInfo | URL, init?: RequestInit | undefined) {
      init!.headers = Object.assign(init?.headers ?? {}, {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token') as string,
      })
      try {
        const response = await fetch(input, init)
        const result = await response.json()
        return result
      } catch (error) {
        console.log(error)
      }
    },
    async addMsg(msgData:MsgData){
      try {
        await db.add('msgList', msgData)
        return true
      } catch (error) {
        return false
      }
    },
    async initMsgList(){
      try {
        this.msgList=await db.findAll('msgList') as any
        /* console.log(this.msgList) */
      } catch (error) {
        console.log(error)
      }
    }
  },
})
