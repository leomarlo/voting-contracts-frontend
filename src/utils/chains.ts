export const supportedChainIds: Array<number> = [
  1, // Mainnet
  5, // Goerli
  137, // Polygon
  1337, // localhost
  80001, // Mumbai
  1337802, // Kiln
  11155111 // Sepolia
]

export const resolveChainId: { [key: string]: number } = {
  mainnet: 1,
  goerli: 5,
  polygon: 137,
  localhost: 1337,
  mumbai: 80001,
  kiln: 1337802,
  sepolia: 11155111
}

export const reverseResolveChainId: { [key: number]: string } = {
  1: "mainnet",
  5: "goerli",
  137: "polygon",
  1337: "localhost",
  80001: "mumbai",
  1337802: "kiln",
  11155111: "sepolia"
}