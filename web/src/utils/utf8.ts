// Reference:
// https://stackoverflow.com/questions/1031645/how-to-detect-utf-8-in-plain-c

export const isUtf8 = (data: Uint8Array) => {
  if (data.length <= 0) {
    return false;
  }
  for (let i = 0; i < data.length; ) {
    const a = data[i];
    if ([0x09, 0x0a, 0x0d].includes(a) || (0x20 <= a && a <= 0x7e)) {
      i += 1;
      continue;
    }

    const b = data[i + 1];
    if (b === undefined) {
      return false;
    }
    if (0xc2 <= a && a <= 0xdf && (0x80 <= b && b <= 0xbf)) {
      i += 2;
      continue;
    }

    const c = data[i + 2];
    if (c === undefined) {
      return false;
    }
    if (
      (a === 0xe0 && (0xa0 <= b && b <= 0xbf) && (0x80 <= c && c <= 0xbf)) ||
      (((0xe1 <= a && a <= 0xec) || a === 0xee || a === 0xef) &&
        (0x80 <= b && b <= 0xbf) &&
        (0x80 <= c && c <= 0xbf)) ||
      (a === 0xed && (0x80 <= b && b <= 0x9f) && (0x80 < c && c <= 0xbf))
    ) {
      i += 3;
      continue;
    }

    const d = data[i + 3];
    if (d === undefined) {
      return false;
    }
    if (
      (a === 0xf0 &&
        (0x90 <= b && b <= 0xbf) &&
        (0x80 <= c && c <= 0xbf) &&
        (0x80 <= d && d <= 0xbf)) ||
      (0xf1 <= a &&
        a <= 0xf3 &&
        (0x80 <= b && b <= 0xbf) &&
        (0x80 <= c && c <= 0xbf) &&
        (0x80 <= d && d <= 0xbf)) ||
      (a === 0xf4 &&
        (0x80 <= b && b <= 0x8f) &&
        (0x80 <= c && c <= 0xbf) &&
        (0x80 <= d && d <= 0xbf))
    ) {
      i += 4;
      continue;
    }

    return false;
  }
  return true;
};

export default { isUtf8 };
