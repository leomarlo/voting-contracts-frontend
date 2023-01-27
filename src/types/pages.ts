enum Pages {
  About,
  VotingContracts,
  VotingContractIntegration,
  VotingRegistrySystem,
  VotingPlayground,
  Documentation
}

interface PageInfo {
  key: string,
  title: string
}

type PageSetter = (newPage: Pages) => void

export {
  Pages,
  PageInfo,
  PageSetter
}