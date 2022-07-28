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

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var Kune = /** @class */ (function () {
        function Kune(options) {
            this.sid = '';
            var url = options.url, topic = options.topic;
            this.topic = topic;
            this.url = url;
            this.wsInst = new WebSocket(url, topic);
            this.wsInst.addEventListener('message', this.handleMessage.bind(this));
            this.handlerSet = new Set();
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
        Kune.prototype.addEventListener = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            (_a = this.wsInst).addEventListener.apply(_a, args);
        };
        Kune.prototype.removeEventListener = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            (_a = this.wsInst).removeEventListener.apply(_a, args);
        };
        Kune.prototype.onmessage = function (handler, options) {
            var _this = this;
            var handlerInfo = { handler: handler, options: options };
            this.handlerSet.add(handlerInfo);
            return function () { return _this.handlerSet.delete(handlerInfo); };
        };
        Kune.prototype.close = function () {
            this.wsInst.close();
        };
        Kune.prototype.handleMessage = function (event) {
            var msg = JSON.parse(event.data);
            if ((msg === null || msg === void 0 ? void 0 : msg.type) === 'protocol') {
                this.handleProtocolMessage(event);
            }
            else {
                var handlerIterator = this.handlerSet.values();
                for (var cur = handlerIterator.next(); !cur.done; cur = handlerIterator.next()) {
                    var info = cur.value;
                    try {
                        info.handler.bind(this.wsInst)(event);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
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
        return Kune;
    }());

    return Kune;

}));
