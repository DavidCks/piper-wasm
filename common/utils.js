export var lengthBytesUTF8 = (str) => {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var c = str.charCodeAt(i);
    if (c <= 127) {
      len++;
    } else if (c <= 2047) {
      len += 2;
    } else if (c >= 55296 && c <= 57343) {
      len += 4;
      ++i;
    } else {
      len += 3;
    }
  }
  return len;
};

export var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i);
      u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 192 | (u >> 6);
      heap[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 224 | (u >> 12);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 240 | (u >> 18);
      heap[outIdx++] = 128 | ((u >> 12) & 63);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    }
  }
  heap[outIdx] = 0;
  return outIdx - startIdx;
};

export var stringToUTF8 = (str, outPtr, maxBytesToWrite, HEAPS) =>
  stringToUTF8Array(str, HEAPS["__HEAPU8"], outPtr, maxBytesToWrite);

export function setValue(ptr, value, type = "i8", HEAPS) {
  if (type.endsWith("*")) type = "*";
  switch (type) {
    case "i1":
      HEAPS["__HEAP8"][ptr >> 0] = value;
      break;
    case "i8":
      HEAPS["__HEAP8"][ptr >> 0] = value;
      break;
    case "i16":
      HEAPS["__HEAP16"][ptr >> 1] = value;
      break;
    case "i32":
      HEAPS["__HEAP32"][ptr >> 2] = value;
      break;
    case "i64":
      abort("to do setValue(i64) use WASM_BIGINT");
    case "float":
      HEAPS["__HEAPF32"][ptr >> 2] = value;
      break;
    case "double":
      HEAPS["__HEAPF64"][ptr >> 3] = value;
      break;
    case "*":
      HEAPS["__HEAPU32"][ptr >> 2] = value;
      break;
    default:
      abort(`invalid type for setValue: ${type}`);
  }
}
