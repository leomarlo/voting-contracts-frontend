enum Pages {
  About,
  VotingContracts,
  VotingPlayground,
  VotingContractIntegration,
  VotingRegistry,
  VotingRegistrars,
  VotingResolvers,
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