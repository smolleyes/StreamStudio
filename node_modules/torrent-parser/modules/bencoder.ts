"use strict";

class Decode {

  position: number;
  encoding: string;
  data:     Buffer;
  bytes:    number;
  constructor(data, start?: number, end?: number, encoding?: string) {
    if (data == null || data.length === 0) {
      return null;
    }

    if (typeof start !== "number" && encoding == null) {
      encoding = start;
      start = undefined;
    }

    if (typeof end !== "number" && encoding == null) {
      encoding = end;
      end = undefined;
    }

    this.position = 0;
    this.encoding = encoding || null;

    this.data = !(Buffer.isBuffer(data))
      ? new Buffer(data)
      : data.slice(start, end);

    this.bytes = this.data.length;

    return this.next();
  }

  next() {
    switch (this["data"][this["position"]]) {
      case 0x64:
        return this.dictionary();
      case 0x6C:
        return this.list();
      case 0x69:
        return this.integer();
      default:
        return this.buffer();
    }
  }

  find(chr) {
    let i = this.position;
    let c = this.data.length;
    let d = this.data;

    while (i < c) {
      if (d[i] === chr) return i;
      i++;
    }

    throw new Error(
      "Invalid data: Missing delimiter \"" +
      String.fromCharCode(chr) + "\" [0x" +
      chr.toString(16) + "]"
    );
  }

  dictionary() {
    this.position++;

    let dict = {};

    while (this.data[this.position] !== 0x65) {
      dict[this.buffer()] = this.next();
    }

    this.position++;

    return dict;
  }

  list() {
    this.position++;

    let lst = [];

    while (this.data[this.position] !== 0x65) {
      lst.push(this.next());
    }

    this.position++;

    return lst;
  }

  integer() {
    let ending = this.find(0x65);
    let result = getIntFromBuffer(this.data, this.position + 1, ending);

    this.position += ending + 1 - this.position;

    return result;
  }

  buffer() {
    let sep = this.find(0x3A);
    let length = getIntFromBuffer(this.data, this.position, sep);
    let end = ++sep + length;

    this.position = end;

    return this.encoding
      ? this.data.toString(this.encoding, sep, end)
      : this.data.slice(sep, end);
  }
}


class Encode {
  buffE:                    Buffer;
  buffD:                    Buffer;
  buffL:                    Buffer;
  bytes:                    number;
  _floatConversionDetected: Boolean;
  constructor(data, buffer?: Buffer, offset?: number) {
    this.buffE                    = new Buffer("e");
    this.buffD                    = new Buffer("d");
    this.buffL                    = new Buffer("l");
    this.bytes                    = -1;
    this._floatConversionDetected = false;

    let buffers = [];
    let result = null;

    this._encode(buffers, data);
    result = Buffer.concat(buffers);
    this.bytes = result.length;

    if (Buffer.isBuffer(buffer)) {
      result.copy(buffer, offset);
      return buffer;
    }

    return result;
  }

  _encode(buffers: Array<Buffer>, data) {
    if (Buffer.isBuffer(data)) {
      buffers.push(new Buffer(data.length + ":"));
      buffers.push(data);
      return;
    }

    if (data == null) { return; }

    switch (typeof data) {
      case "string":
        this.buffer(buffers, data);
        break;
      case "number":
        this.number(buffers, data);
        break;
      case "object":
        data.constructor === Array
          ? this.list(buffers, data)
          : this.dict(buffers, data);
        break;
      case "boolean":
        this.number(buffers, data ? 1 : 0);
        break;
    }
  }

  buffer(buffers, data) {
    buffers.push(new Buffer(Buffer.byteLength(data) + ":" + data));
  }

  number(buffers: Array<Buffer>, data) {
    let maxLo = 0x80000000;
    let hi = (data / maxLo) << 0;
    let lo = (data % maxLo) << 0;
    let val = hi * maxLo + lo;

    buffers.push(new Buffer("i" + val + "e"));

    if (val !== data && !this._floatConversionDetected) {
      this._floatConversionDetected = true;
      console.warn(
        "WARNING: Possible data corruption detected with value \"" + data + "\":",
        "Bencoding only defines support for integers, value was converted to \"" + val + "\""
      );
      console.trace();
    }
  }

  dict(buffers: Array<Buffer>, data) {
    buffers.push(this.buffD);

    let j = 0;
    let k;

    let keys = Object.keys(data).sort();
    let kl = keys.length;

    for (; j < kl; j++) {
      k = keys[j];
      if (data[k] == null) continue;
      this.buffer(buffers, k);
      this._encode(buffers, data[k]);
    }

    buffers.push(this.buffE);
  }

  list(buffers: Array<Buffer>, data) {
    let i = 0;
    let c = data.length;
    buffers.push(this.buffL);

    for (; i < c; i++) {
      if (data[i] == null) continue;
      this._encode(buffers, data[i]);
    }

    buffers.push(this.buffE);
  }
}

function getIntFromBuffer (buffer: Buffer, start: Number, end: Number) {
  let sum = 0;
  let sign = 1;

  for (let i = start; i < end; i++) {
    let num = buffer[i];
    if (num < 58 && num >= 48) {
      sum = sum * 10 + (num - 48);
      continue;
    }
    if (i === start && num === 43) { // +
      continue;
    }
    if (i === start && num === 45) { // -
      sign = -1;
      continue;
    }
    if (num === 46) { // .
      // its a float. break here.
      break;
    }
    throw new Error("not a number: buffer[" + i + "] = " + num);
  }
  return sum * sign;
}

export { Decode, Encode }
