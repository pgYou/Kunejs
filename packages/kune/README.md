# kune 简单协同客户端

## 安装

提供 npm 和 umd 两种方式。

1、npm 安装

```sh
npm install kunejs --save
```

2、直接引入 umd

```html
<script src="https://raw.githubusercontent.com/pgYou/Kunejs/main/packages/kune/umd/kune.min.js"></script>
```

## usage

```js
// 指定服务端url和话题，创建一个peer，连接一个频道
const kune = new Kune({ url, topic: 'xxx' });

// 处理topic 频道消息
kune.addListener('message', () => {
  // handler message
});

// 向topic，发送纯文本消息
kune.send('hola ~');

// 或者发送复杂json消息
kune.send({
  msg: 'hola ~',
});
```
