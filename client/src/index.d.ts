declare type User = {
  username: string
  password: string
}

type Data = {
  type: string
  data: any
}

interface RequestInit {
  body?: any | BodyInit | null
}

interface MsgData {
  whoSendId: string
  targetId: string
  msg: string
  dateTime: string
}
