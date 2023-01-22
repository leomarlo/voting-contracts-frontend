import { Pages, PageInfo } from "../types/pages"

const pageInfo: { [name in Pages]: PageInfo } = {
  [Pages.About]: { key: 'about', title: 'About' },
  [Pages.VotingContracts]: { key: 'voting-contracts', title: 'Voting Contracts' },
  [Pages.VotingPlayground]: { key: 'voting-playground', title: 'Playground' },
  [Pages.VotingContractIntegration]: { key: 'voting-contract-integration', title: 'Voting Contract Integration' },
  [Pages.VotingRegistrySystem]: { key: 'voting-registry', title: 'Voting Registry' }
}

export {
  pageInfo
}