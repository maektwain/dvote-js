import { EthNetworkID, VocdoniEnvironment } from "@vocdoni/common"
import { Signer } from "@ethersproject/abstract-signer"
import { Wallet } from "@ethersproject/wallet"
import { BaseProvider } from "@ethersproject/providers"
import { Contract, ContractInterface } from "@ethersproject/contracts"
import { ParamType, Interface } from "@ethersproject/abi"
import { IEnsPublicResolverContract, IGenesisContract, INamespacesContract, IProcessesContract, IResultsContract, ITokenStorageProofContract } from "@vocdoni/contract-wrappers"
import { ApiMethod, BackendApiName, GatewayApiName } from "./apis/definition"
import { ContentUri } from "./wrappers/content-uri"

export interface IGatewayDVoteClient {
    get supportedApis(): (GatewayApiName | BackendApiName)[]

    init(): Promise<any>

    get isReady(): boolean
    get dvoteUri(): string
    get environment(): VocdoniEnvironment

    sendRequest(requestBody: IRequestParameters, wallet?: Wallet | Signer, params?: { timeout: number }): Promise<DVoteGatewayResponseBody>
}

export interface IGatewayWeb3Client {
    get chainId(): Promise<number>
    get networkId(): Promise<string>
    get provider(): BaseProvider
    get web3Uri(): string
    get archiveIpnsId(): string
    set archiveIpnsId(ipnsId: string)
    disconnect(): void

    deploy<CustomContractMethods>(abi: string | (string | ParamType)[] | Interface, bytecode: string,
                                  signParams: { signer?: Signer, wallet?: Wallet }, deployArguments: any[]): Promise<(Contract & CustomContractMethods)>
    attach<CustomContractMethods>(address: string, abi: ContractInterface): (Contract & CustomContractMethods)

    getEnsPublicResolverInstance(walletOrSigner?: Wallet | Signer, customAddress?: string): Promise<IEnsPublicResolverContract>
    getProcessesInstance(walletOrSigner?: Wallet | Signer, customAddress?: string): Promise<IProcessesContract>
    getGenesisInstance(walletOrSigner?: Wallet | Signer, customAddress?: string): Promise<IGenesisContract>
    getNamespacesInstance(walletOrSigner?: Wallet | Signer, customAddress?: string): Promise<INamespacesContract>
    getResultsInstance(walletOrSigner?: Wallet | Signer, customAddress?: string): Promise<IResultsContract>
    getTokenStorageProofInstance(walletOrSigner?: Wallet | Signer, customAddress?: string): Promise<ITokenStorageProofContract>
}

export interface IGatewayClient extends IGatewayDVoteClient, IGatewayWeb3Client { }

/** Parameters sent by the function caller */
export interface IRequestParameters {
    // Common
    method: ApiMethod,
    timestamp?: number,

    [k: string]: any
}

export type DVoteGatewayResponseBody = {
    ok: boolean,
    request: string,
    message?: string,
    timestamp?: number,
    signature?: string,

    // the rest of fields
    [k: string]: any
}

export interface IGatewayDiscoveryParameters {
    networkId: EthNetworkID,
    environment?: VocdoniEnvironment
    bootnodesContentUri: string | ContentUri
    archiveIpnsId?: string
    numberOfGateways?: number
    /** Timeout in milliseconds */
    timeout?: number
    resolveEnsDomains?: boolean
}

export interface IArchiveResponseBody {
    // process: ProcessSummary
    process: any
    results: {
        processId: string
        votes: string[][]
        weight: string
        envelopeHeight: number
        envelopeType: {
            encryptedVotes: boolean
        },
        voteOptions: {
            costExponent: number
            maxCount: number
            maxValue: number
            maxTotalCost?: number
            maxVoteOverwrites: number
        },
        signatures: null
        final: boolean
        blockHeight: number
    }
}
