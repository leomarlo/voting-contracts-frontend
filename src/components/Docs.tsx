import React, { useState } from "react";
import { DetailsHandling } from "../types/components"
import { useWeb3React } from "@web3-react/core"
import { ethers } from 'ethers'
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"
import { getContractAddressesForAllChains, getBlockexplorerBaseUrlFromChainId } from "../utils/web3"
import { reverseResolveChainId, supportedChainIds } from "../utils/chains";

enum DocumentationSections {
  DeployedContract = "Deployed Contracts",
}

type DocumentationSectionsFlags = { [section in DocumentationSections]: boolean }
type DocumentationSectionsContents = { [section in DocumentationSections]: JSX.Element }


interface DocumentationArgs {
  detailsHandling: DetailsHandling
}

function DeployedContractsSection(): JSX.Element {

  let contractAddressesForAllChains = getContractAddressesForAllChains()
  return (
    <>
      {supportedChainIds
        .filter((id: number) => (id != 1337))
        .map((id: number) => {
          let name = reverseResolveChainId[id]
          let headerName = name.charAt(0).toUpperCase() + name.slice(1);
          if (id == 1) {
            headerName = "Ethereum Mainnet"
          } else if (id == 421613) {
            headerName = "Arbitrum Goerli"
          }
          let deployedContractsForThisChain = Object.keys(contractAddressesForAllChains[name])
          return (
            <div className="card" style={{ marginBottom: "30px", padding: "15px" }}>
              <div className="card-header">
                <div style={{ width: "80%", display: "inline-block", textAlign: "left" }}><h4>{headerName}</h4></div>
                <div style={{ width: "20%", display: "inline-block", textAlign: "right" }}>{`Chain Id: ${id}`}</div>
              </div>
              <table className="table" style={{ borderCollapse: "collapse", paddingLeft: "8px", paddingRight: "8px", paddingTop: "4px", paddingBottom: "4px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "40%", textAlign: "left" }}>Name</th>
                    <th style={{ width: "60%", textAlign: "left" }}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {deployedContractsForThisChain.map((contract) => {
                    return (
                      <tr>
                        <td style={{ textAlign: "left", paddingRight: "20px" }}>{contract}</td>
                        <td style={{ fontFamily: "monospace", textAlign: "left" }}>
                          <a href={getBlockexplorerBaseUrlFromChainId(id, false) + "/address/" + contractAddressesForAllChains[name][contract] + "#code"}>{contractAddressesForAllChains[name][contract]}</a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
    </>
  )
}


const DocumentationComp: React.FC<DocumentationArgs> = ({ detailsHandling }: DocumentationArgs) => {
  let thisPageInfo: PageInfo = pageInfo[Pages.Documentation]
  const { account, chainId, library } = useWeb3React<ethers.providers.Web3Provider>()

  const initialDisplaySection: DocumentationSectionsFlags = {
    [DocumentationSections.DeployedContract]: true
  }

  const sectionContent: DocumentationSectionsContents = {
    [DocumentationSections.DeployedContract]: DeployedContractsSection()
  }

  const [displaySection, setDisplaySection] = useState<DocumentationSectionsFlags>(initialDisplaySection)

  const setDisplayThisSection = (section: DocumentationSections, flag: boolean) => {
    let displaySectionTemp = { ...displaySection }
    displaySectionTemp[section] = flag
    setDisplaySection(displaySectionTemp)
  }

  const changeDisplayThisSection = (section: DocumentationSections) => {
    displaySection[section] ? setDisplayThisSection(section, false) : setDisplayThisSection(section, true);
  }

  return (
    <div style={{
      overflowY: "auto",
      height: "800px",
      paddingLeft: "10px",
      paddingRight: "15px",
      paddingBottom: "15px"
    }}>
      <div key={thisPageInfo.key}>
        <h3>{thisPageInfo.title}</h3>
        <hr />
        {Object.keys(DocumentationSections).filter((v) => isNaN(Number(v))).map((section) => {
          let sc = DocumentationSections[section as keyof typeof DocumentationSections]
          return (
            <>
              <h4
                style={{ cursor: "pointer" }}
                onClick={() => changeDisplayThisSection(sc)}
              >{(displaySection[sc] ? '⯆ ' : '⯈ ') + sc}</h4>
              {displaySection[sc] ? <div style={{ paddingLeft: "30px" }}>{sectionContent[sc]}</div> : <></>}
              <hr />
            </>

          )
        })}
      </div>
    </div>

  )
}

export {
  DocumentationComp
}