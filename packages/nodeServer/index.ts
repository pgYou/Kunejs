import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket, RawData } from 'ws';

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

function genId(options?: { length?: number; prefix?: string }) {
  const { length = 6, prefix } = options || {};
  let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i)
    result += str[Math.floor(Math.random() * str.length)];
  if (prefix) {
    result = `${prefix}-${result}`;
  }
  return result;
}

export default class KuneServer {
  private msgPipe: EventEmitter;
  private wsServer: WebSocketServer;
  constructor(options: { port: number }) {
    const { port = 8080 } = options;
    this.msgPipe = new EventEmitter();
    this.wsServer = new WebSocketServer({ port });
    this.wsServer.on('connection', this.connectHandler.bind(this));
  }
  private static isStandardType(type: string): type is BaseMessage['type'] {
    return type === 'json' || type === 'protocol' || type === 'text';
  }

  private connectHandler(ws: WebSocket) {
    const topic = ws.protocol || 'default';
    // 生成id，前缀s代表是一个sid，ws连接的唯一标识
    const sid = genId({ prefix: 's' });
    ws.send(JSON.stringify({ type: 'protocol', data: { sid, topic } }));
    console.log('[kune-server] connected:', { sid, topic });
    const onMessage = this.messageHandlerProvide(ws, sid, topic);
    const onPipeMessage = this.pipeMessageHandlerProvide(ws, sid, topic);

    this.msgPipe.on(topic, onPipeMessage);
    ws.on('message', onMessage);
    ws.on('close', () => {
      this.msgPipe.off(topic, onPipeMessage);
      console.log('close');
    });
    ws.on('error', (e: Error) => {
      this.msgPipe.off(topic, onPipeMessage);
      console.log('error', e);
    });
  }

  /**
   * 提供一个事件监听函数，为指定的 ws链接，监听msgPipe中指定的topic事件。若该topic有事件，会同步给该ws连接（下发消息）
   * @param ws websocket链接实例
   * @param sid 客户端链接唯一id
   * @param topic 话题
   * @returns onPipeMessage
   */
  private pipeMessageHandlerProvide(ws: WebSocket, sid: string, topic: string) {
    const onPipeMessage = (msg: Message) => {
      console.log('[kune-server] dispatch msg', msg);
      if (msg.type === 'text') {
        ws.send(msg.data);
      } else {
        ws.send(JSON.stringify(msg));
      }
    };
    return onPipeMessage;
  }

  /**
   * 提供一个事件监听函数，监听 指定的 ws连接，如果ws 有上行消息，会提交到msgPipe(事件管道)，从而同步给该topic下的其他 ws连接 包括自己
   * @param ws websocket链接实例
   * @param sid 客户端链接唯一id
   * @param topic 话题
   * @returns onMessage
   */
  private messageHandlerProvide(ws: WebSocket, sid: string, topic: string) {
    const onMessage = (message: RawData, isBinary: boolean) => {
      let data: BaseMessage;
      try {
        data = JSON.parse(`${message}`);
        if (!KuneServer.isStandardType(data.type) || !data.data) {
          console.log('[kune-server] non-standard format:', data);
          throw new Error('non-standard format');
        }
      } catch (e) {
        data = { data: `${message}`, type: 'text' };
        console.log(`[kune-server] received unparseable message: ${message}`);
      }
      const msg: Message = {
        ...data,
        from: sid,
        time: new Date(),
        // 生成id，前缀m代表是一个msg id，消息的唯一标识
        id: genId({ prefix: 'm' }),
      };
      if (msg.type !== 'protocol') {
        this.publishMsg(topic, msg);
      }
    };
    return onMessage;
  }
  /**
   * 发布topic消息
   * @param topic 话题
   * @param msg 消息体
   */
  private publishMsg(topic: string, msg: Message) {
    this.msgPipe.emit(topic, msg);
  }
}
