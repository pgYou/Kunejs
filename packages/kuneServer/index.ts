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
    ws.on('error', (e: Event) => {
      this.msgPipe.off(topic, onPipeMessage);
      console.log('error', e);
    });
  }

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
        id: genId({ prefix: 'm' }),
      };
      if (msg.type !== 'protocol') {
        this.publishMsg(topic, msg);
      }
    };
    return onMessage;
  }

  private publishMsg(topic: string, msg: Message) {
    this.msgPipe.emit(topic, msg);
  }
}
