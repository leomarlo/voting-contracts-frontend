import React, { useEffect, useState } from "react"
import { ethers, ContractReceipt } from "ethers"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  VotingInstanceInfo,
  DoubleVotingGuard,
  TokenInfo,
  ErcInterfaceFlags,
  InstanceInternalInfo,
  VotingInstanceExternalInfo,
  InstanceInternalInfoAndPointer
} from "../utils/web3"

// interface ErcInterfaceFlags {
//   erc165: boolean,
//   erc721: boolean,
//   erc1155: boolean,
// }

// interface TokenInfo {
//   name: string,
//   symbol: string,
//   address: string,
//   interfaces: ErcInterfaceFlags
// }
// enum DoubleVotingGuard { none, onSender, onVotingData }

// interface VotingInstanceExternalInfo {
//   votingContract: ethers.Contract,
//   identifier: ethers.BigNumber,
//   deadline: string | undefined,
//   ttl: number | undefined,
//   status: string | undefined,
//   token: TokenInfo | undefined,
//   doubleVotingGuard: DoubleVotingGuard | undefined,
//   quorum: { value: string, inUnitsOf: string } | undefined
// }

// interface TargetInterface {
//   id: string | undefined,
//   name?: string,
//   isFunction: boolean
// }

// interface InstanceInternalInfo {
//   index: number,
//   sender: string | undefined,
//   target: TargetInterface
// }

// interface InstancePointer {
//   identifier: ethers.BigNumber,
//   votingContractAddress: string
// }

// type InstanceInternalInfoAndPointer = InstanceInternalInfo & InstancePointer;

// type VotingInstanceInfo = InstanceInternalInfo & InstancePointer & VotingInstanceExternalInfo;



interface VoteOnInstanceArgs {
  instance: VotingInstanceInfo
  playground: ethers.Contract,
  updateInstanceInfos: (
    index: ethers.BigNumber,
    property: string | undefined,
    transactionHashAndAttempts?: {
      transactionHash?: string,
      successfulAttempt: boolean,
      successfulImplement: boolean,
      attempts: number
    }) => Promise<null | undefined>
}

const formatAsCalldata = (calldata: string, withSelector: boolean = true) => {
  let CalldataRows: Array<string> = []
  let selectorOffset: number = withSelector ? 10 : 2
  // if (withSelector) 
  CalldataRows.push(calldata.slice(0, selectorOffset))
  for (let k = 0; k < Math.ceil((calldata.length - selectorOffset) / 64); k++) {
    CalldataRows.push(calldata.slice(selectorOffset + k * (64), Math.min(selectorOffset + (k + 1) * 64, calldata.length)))
  }
  return (
    <div style={{ fontFamily: "monospace" }}>
      {CalldataRows.map((row) => { return (<>{row}<br /></>) })}
    </div>
  )
}

const VoteOnInstance: React.FC<VoteOnInstanceArgs> = ({ instance, playground, updateInstanceInfos }: VoteOnInstanceArgs) => {

  const [receipt, setReceipt] = useState<ContractReceipt | string>("")
  const [votingDataOption, setVotingDataOption] = useState(
    {
      data: ethers.constants.HashZero,
      yes: false,
      no: true
    }
  )
  let calldata = instance.internal.target.calldata
  let CalldataRows: JSX.Element = formatAsCalldata(calldata)


  const handleVotingDataSelection = (event: any) => {
    let tempVotingDataOption = { ...votingDataOption }
    if (event.target.value == "no") {
      tempVotingDataOption.no = true
      tempVotingDataOption.yes = false
      tempVotingDataOption.data = ethers.constants.HashZero
      setVotingDataOption(tempVotingDataOption)
    } else if (event.target.value == "yes") {
      tempVotingDataOption.no = false
      tempVotingDataOption.yes = true
      tempVotingDataOption.data = ethers.utils.hexZeroPad(ethers.utils.hexlify(1), 32)
      setVotingDataOption(tempVotingDataOption)
    } else {
      tempVotingDataOption.no = true
      tempVotingDataOption.yes = false
      tempVotingDataOption.data = ethers.constants.HashZero
      setVotingDataOption(tempVotingDataOption)
    }
  }

  const getBalance = (balance: ethers.BigNumber, decimals: ethers.BigNumber | undefined) => {
    if (decimals === undefined) return balance.toString()
    return ethers.utils.formatUnits(balance, decimals)
  }

  const notify = (message: string) => toast(message);

  const submitVoteToChain = async (event: any) => {
    // console.log('event', event)
    // console.log([instance.internal.index, votingDataOption.data])
    if (instance.external.doubleVotingGuard === "On Voting Data") {
      try {
        let tx = await playground.vote(instance.internal.index, votingDataOption.data)
        setReceipt(await tx.wait())
        await updateInstanceInfos(instance.internal.index, "all")
      } catch (err) {
        setReceipt("")
        // await notify(JSON.stringify(err))
      }
    } else {
      try {
        let tx = await instance.external.votingContract.vote(instance.external.identifier, votingDataOption.data)
        setReceipt(await tx.wait())
      } catch (err) {
        setReceipt("")
        // await notify(JSON.stringify(err))
      }
    }
  }

  const submitImplementToChain = async (event: any) => {
    try {
      let tx = await playground.implement(instance.internal.index, instance.internal.target.calldata)
      let receipt = await tx.wait()
      setReceipt(receipt)
      try {
        let status = await instance.external.votingContract.getStatus(instance.external.identifier)

        if (status.toString() == "1") {
          await updateInstanceInfos(
            instance.internal.index,
            "transactionHash",
            {
              transactionHash: receipt.transactionHash,
              successfulAttempt: true,
              successfulImplement: true,
              attempts: (instance.chainInfo.attempts + 1)
            })
        } else if (status.toString() == "2") {
          await updateInstanceInfos(
            instance.internal.index,
            "transactionHash",
            {
              transactionHash: receipt.transactionHash,
              successfulAttempt: true,
              successfulImplement: false,
              attempts: (instance.chainInfo.attempts + 1)
            })
        } else {
          await updateInstanceInfos(
            instance.internal.index,
            "transactionHash",
            {
              successfulAttempt: false,
              successfulImplement: false,
              attempts: (instance.chainInfo.attempts + 1)
            })
        }
      } catch (err) {
        console.log("Doens't have a status getter method.")
      }

    } catch (err) {
      setReceipt("")
      // await notify(JSON.stringify(err))
      await updateInstanceInfos(
        instance.internal.index,
        "transactionHash",
        {
          successfulAttempt: false,
          successfulImplement: instance.chainInfo.successfulImplement,
          attempts: (instance.chainInfo.attempts + 1)
        })
    }
  }

  const tokenInfo: TokenInfo | undefined = instance.external.token

  const submisionButtonsEnabled = () => {
    // TODO: Need to update the successfull attempts immediately after the submission
    let implementationHappened: boolean = instance.chainInfo.successfulAttempt
    let implementingPermittedCondition: boolean = instance.external.implementingPermitted ? instance.external.implementingPermitted : false
    let statusCondition = instance.external.status ? instance.external.status == "4" : false
    let deadlineCondition: boolean = instance.external.ttl == 0
    let noInformationAboutPermissionOrStatus = (instance.external.status === undefined && instance.external.implementingPermitted === undefined)
    let voteCondition = instance.external.status ? (!["0", "1", "2", "4"].includes(instance.external.status)) : false
    return {
      vote: (!implementationHappened) &&
        (
          noInformationAboutPermissionOrStatus ||
          voteCondition
        ),
      implement: (!implementationHappened) &&
        (
          noInformationAboutPermissionOrStatus ||
          (implementingPermittedCondition || statusCondition) ||
          deadlineCondition || // FIXME: Actually this condition should be revised!!
          implementationHappened
        )
    }
  }

  return (
    <div style={{ overflowY: "scroll", maxHeight: "90vh" }}>
      <h3> Details about the Voting Instance</h3>
      <p>
        This is instance number {`#${instance.internal.index.toString()}`} of the Playground App. <br />It was instantiated by {instance.internal.sender}.
        {/* It targets the function {instance.target.id} {instance.target.isFunction ? `(${instance.target.name})` : ""}. */}
      </p>
      <hr></hr>
      <div>
        <div style={{ width: "70%", padding: "4px", display: "inline-block" }}>
          <div style={{ width: "40%", padding: "4px", display: "inline-block" }}><h4>Vote</h4></div>
          <div style={{ width: "30%", padding: "4px", display: "inline-block" }}>
            <input onChange={(event) => handleVotingDataSelection(event)} type="radio" id="no" name="votingData" value="no" checked={votingDataOption.no} /> No
          </div>
          <div style={{ width: "30%", padding: "4px", display: "inline-block" }}>
            <input onChange={(event) => handleVotingDataSelection(event)} type="radio" id="yes" name="votingData" value="yes" checked={votingDataOption.yes} /> Yes
          </div>
        </div>
        <div style={{ width: "30%", padding: "4px", display: "inline-block" }}>
          <button onClick={(event) => submitVoteToChain(event)} className="btn btn-success" style={{ width: "100%" }} disabled={!submisionButtonsEnabled().vote}>Submit Vote</button>
        </div>
      </div>
      <div>
        <div style={{ width: "70%", padding: "4px", display: "inline-block" }}></div>
        <div style={{ width: "30%", padding: "4px", display: "inline-block" }}>
          <button onClick={(event) => submitImplementToChain(event)} className="btn btn-warning" style={{ width: "100%" }} disabled={!submisionButtonsEnabled().implement}>Implement</button>

        </div>
      </div>
      <hr />
      {typeof receipt === 'string' ? <></> :
        <div>
          {`Transaction was mined at ${receipt.transactionHash}`}
        </div>
      }
      <hr />
      <table style={{ verticalAlign: "middle" }} className="table">
        <tbody>
          {instance.chainInfo.hash ?
            <tr>
              <th scope="col" >Transaction Hash</th>
              <td>
                {instance.chainInfo.hash}
              </td>
            </tr> :
            <></>
          }
          <tr>
            <th scope="col" >Target Function</th>
            <td>
              {(instance.internal.target.name ? instance.internal.target.name + ` (${instance.internal.target.id})` : `(${instance.internal.target.id})`)}
            </td>
          </tr>
          <tr>
            <th scope="col" >Voting Contract</th>
            <td>
              {`${instance.pointer.votingContractAddress}`}
            </td>
          </tr>
          <tr>
            <th scope="col" >Instance Identifier</th>
            <td>
              {`#${instance.external.identifier.toString()}`}
            </td>
          </tr>
          <tr>
            <th scope="col" >Deadline</th>
            <td>
              {`${instance.external.deadline}   (${instance.external.ttl} seconds left)`}
            </td>
          </tr>
          <tr>
            <th scope="col" >Status</th>
            <td>
              {instance.external.status ? instance.external.status.toString() : "No Status"}
            </td>
          </tr>

          <tr>
            <th scope="col" >Quorum</th>
            <td>
              {instance.external.quorum ?
                ((instance.external.quorum.inUnitsOf.toString() == "0") ?
                  `${instance.external.quorum.value.toString()}` + (instance.external.token ? " tokens" : "") :
                  `${100 * parseInt(instance.external.quorum.value) / parseInt(instance.external.quorum.inUnitsOf)}% of total token supply.`
                ) : "not known"}
            </td>
          </tr>
          <tr>
            <th scope="col" >Tokend Weighted</th>
            <td>
              {tokenInfo ? `Yes: ${tokenInfo.name} (${tokenInfo.symbol})` : "No"}
            </td>
          </tr>
          {tokenInfo !== undefined ? (
            <>
              <tr>
                <th scope="col" >Token Address</th>
                <td>
                  {`${tokenInfo.address}`}
                </td>
              </tr>
              <tr>
                <th scope="col" >Token Type</th>
                <td>
                  {Object.keys(tokenInfo.interfaces).map((k) => { return (<>{k.toString() + ": " + tokenInfo.interfaces[k as keyof ErcInterfaceFlags]}<br /></>) })}
                </td>
              </tr>
              <tr>
                <th scope="col" >Token Balance</th>
                <td>
                  {
                    `${getBalance(tokenInfo.balance, tokenInfo.decimals)}` +
                    (tokenInfo.balanceBySelector ?
                      ` (` +
                      `start: ${tokenInfo.balanceBySelector?.start.toString()}, ` +
                      `vote: ${tokenInfo.balanceBySelector?.vote.toString()}, ` +
                      `implement: ${tokenInfo.balanceBySelector?.implement.toString()})` :
                      ""
                    )}
                </td>
              </tr>
            </>
          ) : <></>}
          <tr>
            <th scope="col" >Double Voting Guard</th>
            <td>
              {instance.external.doubleVotingGuard !== undefined ? ((instance.external.doubleVotingGuard !== "None") ? (`Yes: ` + instance.external.doubleVotingGuard) : "No") : "No"}
            </td>
          </tr>
          <tr>
            <th scope="col" >Implementing Permitted</th>
            <td>
              {instance.external.implementingPermitted !== undefined ? (instance.external.implementingPermitted.toString()) : "Not known."}
            </td>
          </tr>
          <tr className="table-warning">
            <th scope="col" style={{ verticalAlign: "top" }}>Execution target</th>
            <td style={{ fontFamily: "monospace", maxHeight: "30px", overflowY: "scroll" }}>
              {instance.external.targetAddress + (instance.external.targetAddress == playground.address ? " (Voting Playground)" : "")}
            </td>
          </tr>
          <tr className="table-warning">
            <th scope="col" style={{ verticalAlign: "top" }}>Execution calldata</th>
            <td style={{ maxHeight: "30px", overflowY: "scroll" }}>
              {CalldataRows}
            </td>
          </tr>
          <tr >
            <th scope="col" style={{ verticalAlign: "top" }}>Result</th>
            <td style={{ fontFamily: "monospace" }}>
              {formatAsCalldata(instance.external.result, false)}
            </td>
          </tr>
        </tbody>
      </table>
      <hr></hr>

      <table className="table">
        <tbody>
          <tr>
            <th scope="col">
              {"To  "}
            </th>
            <td>
              {(instance.external.doubleVotingGuard === "On Voting Data" ? `${playground.address} (Voting Playground)` : `Voting Contract (${instance.pointer.votingContractAddress})`)}
            </td>
          </tr>
          <tr>
            <th scope="col">
              {"Vote Calldata  "}
            </th>
            <td>
              {/* TODO: Why does the Voting data not update when i change the vote */}
              {formatAsCalldata(
                instance.external.doubleVotingGuard === "On Voting Data" ?
                  playground.interface.encodeFunctionData("vote", [instance.internal.index, votingDataOption.data]) :
                  instance.external.votingContract.interface.encodeFunctionData("vote", [instance.external.identifier, votingDataOption.data])
              )
              }
            </td>
          </tr>
        </tbody>
      </table>
    </div>


  )
}

export {
  VoteOnInstance
}