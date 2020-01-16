export default (fn, serializeFn = v => v && v.toString()) => {
  const res = (s, ...args) => fn(...args)
  res.idSelector = (s, ...args) => serializeFn(fn(...args))
  return res
}
