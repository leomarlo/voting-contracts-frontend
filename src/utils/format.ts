
const formatAddress = (value: string, length: number = 4) => {
  return `${value.substring(0, length + 2)}...${value.substring(value.length - length)}`
}

const ellipseString = (value: string, length: number = 4) => {
  if (value.length <= (2 * length)) return value
  return `${value.substring(0, length)}...${value.substring(value.length - length)}`
}

const isAddress = new RegExp(`^0x[0-9A-Fa-f]{40}$`)
const isBytesN = (digits: number) => { return new RegExp(`^0x[0-9A-Fa-f]{${digits * 2}}$`) }
const isUint = new RegExp(`^[0-9]+$`)
const isBytes = new RegExp(`^0x[0-9A-Za-z]+$`)
const isBytes4 = new RegExp(`^0x[0-9A-Za-z]{8}$`)

const type2RegexTest = (type: string) => {
  if (type.startsWith('bytes')) {
    let digits = parseInt(type.slice(5,))
    return isBytesN(digits)
  } else if (type.startsWith('address')) {
    return isAddress
  } else if (type.startsWith('uint')) {
    return isUint
  } else {
    return isBytes
  }
}


export {
  formatAddress,
  ellipseString,
  isBytesN,
  type2RegexTest,
  isBytes,
  isBytes4,
  isAddress,
  isUint
}