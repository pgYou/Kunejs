import { Message, BaseMessage, KuneOptions, SendMsgOptions } from './interface';
import EventEmitter from 'eventemitter3';

class Kune extends EventEmitter {
  wsInst: WebSocket;
  private sid: string = '';
  public topic: string;
  public url: string;

  constructor(options: KuneOptions) {
    super();
    const { url, topic } = options;
    this.topic = topic;
    this.url = url;
    this.wsInst = new WebSocket(url, topic);
    this.initEventsListeners();
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

  close() {
    this.wsInst.close();
  }
  private handleMessage = (event: MessageEvent) => {
    const msg: Message = JSON.parse(event.data);
    if (msg?.type === 'protocol') {
      this.handleProtocolMessage(event);
    } else {
      this.emit('message', event);
    }
  };
  private handleWsOpen = (event: any) => {
    this.emit('open', event);
  };
  private handleWsError = (event: any) => {
    this.emit('error', event);
  };
  private handleWsClose = (event: any) => {
    this.emit('close', event);
  };

  private handleProtocolMessage(event: MessageEvent) {
    const msg: Message = JSON.parse(event.data);
    if (msg.type === 'protocol') {
      console.log('[kune] protocol:', msg);
      this.sid = msg.data.sid;
      event.preventDefault();
      event.stopPropagation();
    }
  }
  private initEventsListeners() {
    this.wsInst.addEventListener('message', this.handleMessage);
    this.wsInst.addEventListener('error', this.handleWsError);
    this.wsInst.addEventListener('close', this.handleWsClose);
    this.wsInst.addEventListener('open', this.handleWsOpen);
  }
  private removeEventsListeners() {
    this.wsInst.removeEventListener('message', this.handleMessage);
    this.wsInst.removeEventListener('error', this.handleWsError);
    this.wsInst.removeEventListener('close', this.handleWsClose);
    this.wsInst.removeEventListener('open', this.handleWsOpen);
  }
  destroy() {
    this.removeEventsListeners();
    this.wsInst.close();
  }
}
export default Kune;
