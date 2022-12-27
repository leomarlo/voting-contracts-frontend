enum Pages {
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

const pageInfo: { [name in Pages]: PageInfo } = {
  [Pages.VotingContracts]: { key: 'voting-contracts', title: 'Voting Contracts' },
  [Pages.VotingPlayground]: { key: 'voting-playground', title: 'Playground' },
  [Pages.VotingContractIntegration]: { key: 'voting-contract-integration', title: 'Voting Contract Integration' },
  [Pages.VotingRegistry]: { key: 'voting-registry', title: 'Voting Registry' },
  [Pages.VotingRegistrars]: { key: 'voting-registrars', title: 'Voting Contract Registrars' },
  [Pages.VotingResolvers]: { key: 'voting-resolvers', title: 'Voting Contract Resolvers' }
}

type PageSetter = (newPage: Pages) => void


export {
  pageInfo,
  Pages,
  PageInfo,
  PageSetter
}