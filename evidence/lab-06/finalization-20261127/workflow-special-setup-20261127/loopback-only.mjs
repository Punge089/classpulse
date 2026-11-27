// Operational isolation only: keep the unmodified app/tests on loopback.
import net from 'node:net';
import { appendFileSync } from 'node:fs';
const original = net.Server.prototype.listen;
net.Server.prototype.listen = function (...args) {
  if (typeof args[0] === 'number') {
    if (typeof args[1] !== 'string') args.splice(1, 0, '127.0.0.1');
    if (!['127.0.0.1', '::1', 'localhost'].includes(args[1])) throw new Error('UAT loopback listener required');
  } else if (args[0] && typeof args[0] === 'object' && 'port' in args[0]) {
    args[0] = { ...args[0], host: args[0].host || '127.0.0.1' };
    if (!['127.0.0.1', '::1', 'localhost'].includes(args[0].host)) throw new Error('UAT loopback listener required');
  }
  this.once('listening', () => {
    const a = this.address();
    if (a && typeof a === 'object' && process.env.UAT_LISTENER_LOG) {
      appendFileSync(process.env.UAT_LISTENER_LOG, JSON.stringify({ at: new Date().toISOString(), pid: process.pid, ...a }) + '\n');
    }
  });
  return original.apply(this, args);
};
