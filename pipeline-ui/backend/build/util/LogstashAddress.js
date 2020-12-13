"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGSTASH = void 0;
exports.LOGSTASH = process.env.NODE_ENV === 'DEV' ? 'localhost' : 'logstash';
