import KuneServer from '@kune/node-server';
import ip from 'ip';

const ipAddress = ip.address();
new KuneServer({ port: 8080 });
console.log('KuneServer ok!');
console.log(`ws://${ipAddress}:8080`);
