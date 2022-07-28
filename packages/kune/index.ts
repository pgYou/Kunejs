import { Message, BaseMessage } from '../interface';
export interface KuneOptions {
  url: string;
  topic: string;
}
export interface SendMsgOptions {
  type: BaseMessage['type'];
  [x: string]: any;
}

type MessageHandler = (this: WebSocket, ev: MessageEvent<any>) => any;
export default class Kune {
  private wsInst: WebSocket;
  private sid: string = '';
  public topic: string;
  public url: string;

  private handlerSet: Set<{ handler: MessageHandler; options: any }>;

  constructor(options: KuneOptions) {
    const { url, topic } = options;
    this.topic = topic;
    this.url = url;
    this.wsInst = new WebSocket(url, topic);
    this.wsInst.addEventListener(
      'message',
      this.handleMessage.bind(this) as any
    );
    this.handlerSet = new Set();
  }

  send(
    msg: string | Omit<BaseMessage, 'type'>,
    options: SendMsgOptions = { type: 'json' }
  ) {
    let message: BaseMessage;
    if (typeof msg === 'string') {
      message = {
        data: msg,
        type: options.type,
      };
    } else {
      message = {
        ...msg,
        type: options.type || msg.type,
      } as BaseMessage;
    }
    console.log('send', JSON.stringify(message));
    this.wsInst.send(JSON.stringify(message));
  }

  addEventListener(...args: Parameters<WebSocket['addEventListener']>) {
    this.wsInst.addEventListener(...args);
  }

  removeEventListener(...args: Parameters<WebSocket['removeEventListener']>) {
    this.wsInst.removeEventListener(...args);
  }

  onmessage(handler: MessageHandler, options?: any) {
    const handlerInfo = { handler, options };
    this.handlerSet.add(handlerInfo);
    return () => this.handlerSet.delete(handlerInfo);
  }

  close() {
    this.wsInst.close();
  }
  private handleMessage(event: MessageEvent) {
    const msg: Message = JSON.parse(event.data);
    if (msg?.type === 'protocol') {
      this.handleProtocolMessage(event);
    } else {
      const handlerIterator = this.handlerSet.values();

      for (
        let cur = handlerIterator.next();
        !cur.done;
        cur = handlerIterator.next()
      ) {
        const info = cur.value;
        try {
          info.handler.bind(this.wsInst)(event);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  private handleProtocolMessage(event: MessageEvent) {
    const msg: Message = JSON.parse(event.data);
    if (msg.type === 'protocol') {
      console.log('[kune] protocol:', msg);
      this.sid = msg.data.sid;
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
