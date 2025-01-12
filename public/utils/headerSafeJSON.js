export function headerSafeJSON(v) {
  return JSON.stringify(v).replace(/[\u007f-\uffff]/g, function (c) {
    return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}
