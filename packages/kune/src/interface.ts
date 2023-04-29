export interface BaseMessage {
  type: 'json' | 'protocol' | 'text';
  data: any;
  [key: string]: any;
}

export interface Message extends BaseMessage {
  from: string;
  time: Date;
  id: string;
}
export interface KuneOptions {
  url: string;
  topic: string;
}
export interface SendMsgOptions {
  type: BaseMessage['type'];
  [x: string]: any;
}
