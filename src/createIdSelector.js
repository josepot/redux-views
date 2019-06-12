export default fn => {
  const res = (s, ...args) => fn(...args)
  res.idSelector = res
  return res
}
