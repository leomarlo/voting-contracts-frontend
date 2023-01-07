
const formatAddress = (value: string, length: number = 4) => {
  return `${value.substring(0, length + 2)}...${value.substring(value.length - length)}`
}

const ellipseString = (value: string, length: number = 4) => {
  if (value.length <= (2 * length)) return value
  return `${value.substring(0, length)}...${value.substring(value.length - length)}`
}

export {
  formatAddress,
  ellipseString
}