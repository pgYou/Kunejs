(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Kune = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function (d, b) {
        d.__proto__ = b;
      } || function (d, b) {
        for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      };

      return extendStatics(d, b);
    };

    function __extends(d, b) {
      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);

      function __() {
        this.constructor = d;
      }

      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
      __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];

          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }

        return t;
      };

      return __assign.apply(this, arguments);
    };

    var eventemitter3 = {exports: {}};

    (function (module) {

      var has = Object.prototype.hasOwnProperty,
          prefix = '~';
      /**
       * Constructor to create a storage for our `EE` objects.
       * An `Events` instance is a plain object whose properties are event names.
       *
       * @constructor
       * @private
       */

      function Events() {} //
      // We try to not inherit from `Object.prototype`. In some engines creating an
      // instance in this way is faster than calling `Object.create(null)` directly.
      // If `Object.create(null)` is not supported we prefix the event names with a
      // character to make sure that the built-in object properties are not
      // overridden or used as an attack vector.
      //


      if (Object.create) {
        Events.prototype = Object.create(null); //
        // This hack is needed because the `__proto__` property is still inherited in
        // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
        //

        if (!new Events().__proto__) prefix = false;
      }
      /**
       * Representation of a single event listener.
       *
       * @param {Function} fn The listener function.
       * @param {*} context The context to invoke the listener with.
       * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
       * @constructor
       * @private
       */


      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }
      /**
       * Add a listener for a given event.
       *
       * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} context The context to invoke the listener with.
       * @param {Boolean} once Specify if the listener is a one-time listener.
       * @returns {EventEmitter}
       * @private
       */


      function addListener(emitter, event, fn, context, once) {
        if (typeof fn !== 'function') {
          throw new TypeError('The listener must be a function');
        }

        var listener = new EE(fn, context || emitter, once),
            evt = prefix ? prefix + event : event;
        if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];
        return emitter;
      }
      /**
       * Clear event by name.
       *
       * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
       * @param {(String|Symbol)} evt The Event name.
       * @private
       */


      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
      }
      /**
       * Minimal `EventEmitter` interface that is molded against the Node.js
       * `EventEmitter` interface.
       *
       * @constructor
       * @public
       */


      function EventEmitter() {
        this._events = new Events();
        this._eventsCount = 0;
      }
      /**
       * Return an array listing the events for which the emitter has registered
       * listeners.
       *
       * @returns {Array}
       * @public
       */


      EventEmitter.prototype.eventNames = function eventNames() {
        var names = [],
            events,
            name;
        if (this._eventsCount === 0) return names;

        for (name in events = this._events) {
          if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }

        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }

        return names;
      };
      /**
       * Return the listeners registered for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Array} The registered listeners.
       * @public
       */


      EventEmitter.prototype.listeners = function listeners(event) {
        var evt = prefix ? prefix + event : event,
            handlers = this._events[evt];
        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];

        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }

        return ee;
      };
      /**
       * Return the number of listeners listening to a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Number} The number of listeners.
       * @public
       */


      EventEmitter.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix ? prefix + event : event,
            listeners = this._events[evt];
        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };
      /**
       * Calls each of the listeners registered for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Boolean} `true` if the event had listeners, else `false`.
       * @public
       */


      EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return false;
        var listeners = this._events[evt],
            len = arguments.length,
            args,
            i;

        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;

            case 2:
              return listeners.fn.call(listeners.context, a1), true;

            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;

            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;

            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;

            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }

          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }

          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length,
              j;

          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);
                break;

              case 2:
                listeners[i].fn.call(listeners[i].context, a1);
                break;

              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);
                break;

              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                break;

              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }

        return true;
      };
      /**
       * Add a listener for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @public
       */


      EventEmitter.prototype.on = function on(event, fn, context) {
        return addListener(this, event, fn, context, false);
      };
      /**
       * Add a one-time listener for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @public
       */


      EventEmitter.prototype.once = function once(event, fn, context) {
        return addListener(this, event, fn, context, true);
      };
      /**
       * Remove the listeners of a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn Only remove the listeners that match this function.
       * @param {*} context Only remove the listeners that have this context.
       * @param {Boolean} once Only remove one-time listeners.
       * @returns {EventEmitter} `this`.
       * @public
       */


      EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return this;

        if (!fn) {
          clearEvent(this, evt);
          return this;
        }

        var listeners = this._events[evt];

        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          } //
          // Reset the array, or remove it completely if we have no more listeners.
          //


          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
        }

        return this;
      };
      /**
       * Remove all listeners, or those of the specified event.
       *
       * @param {(String|Symbol)} [event] The event name.
       * @returns {EventEmitter} `this`.
       * @public
       */


      EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;

        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }

        return this;
      }; //
      // Alias methods names because people roll like that.
      //


      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
      EventEmitter.prototype.addListener = EventEmitter.prototype.on; //
      // Expose the prefix.
      //

      EventEmitter.prefixed = prefix; //
      // Allow `EventEmitter` to be imported as module namespace.
      //

      EventEmitter.EventEmitter = EventEmitter; //
      // Expose the module.
      //

      {
        module.exports = EventEmitter;
      }
    })(eventemitter3);

    var EventEmitter = eventemitter3.exports;

    var Kune = /** @class */ (function (_super) {
        __extends(Kune, _super);
        function Kune(options) {
            var _this = _super.call(this) || this;
            _this.sid = '';
            _this.handleMessage = function (event) {
                var msg = JSON.parse(event.data);
                if ((msg === null || msg === void 0 ? void 0 : msg.type) === 'protocol') {
                    _this.handleProtocolMessage(event);
                }
                else {
                    _this.emit('message', event);
                }
            };
            _this.handleWsOpen = function (event) {
                _this.emit('open', event);
            };
            _this.handleWsError = function (event) {
                _this.emit('error', event);
            };
            _this.handleWsClose = function (event) {
                _this.emit('close', event);
            };
            var url = options.url, topic = options.topic;
            _this.topic = topic;
            _this.url = url;
            _this.wsInst = new WebSocket(url, topic);
            _this.initEventsListeners();
            return _this;
        }
        Kune.prototype.send = function (msg, options) {
            if (options === void 0) { options = { type: 'json' }; }
            var message;
            if (typeof msg === 'string') {
                message = {
                    data: msg,
                    type: options.type,
                };
            }
            else {
                message = __assign(__assign({}, msg), { type: options.type || msg.type });
            }
            console.log('send', JSON.stringify(message));
            this.wsInst.send(JSON.stringify(message));
        };
        Kune.prototype.close = function () {
            this.wsInst.close();
        };
        Kune.prototype.handleProtocolMessage = function (event) {
            var msg = JSON.parse(event.data);
            if (msg.type === 'protocol') {
                console.log('[kune] protocol:', msg);
                this.sid = msg.data.sid;
                event.preventDefault();
                event.stopPropagation();
            }
        };
        Kune.prototype.initEventsListeners = function () {
            this.wsInst.addEventListener('message', this.handleMessage);
            this.wsInst.addEventListener('error', this.handleWsError);
            this.wsInst.addEventListener('close', this.handleWsClose);
            this.wsInst.addEventListener('open', this.handleWsOpen);
        };
        Kune.prototype.removeEventsListeners = function () {
            this.wsInst.removeEventListener('message', this.handleMessage);
            this.wsInst.removeEventListener('error', this.handleWsError);
            this.wsInst.removeEventListener('close', this.handleWsClose);
            this.wsInst.removeEventListener('open', this.handleWsOpen);
        };
        Kune.prototype.destroy = function () {
            this.removeEventsListeners();
            this.wsInst.close();
        };
        return Kune;
    }(EventEmitter));

    return Kune;

}));
