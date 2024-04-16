export const wait = (timeoutMs) => new Promise((resolve) => {
  setTimeout(() => { resolve() }, timeoutMs)
});
