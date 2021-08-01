import { DVoteGatewayResponseBody, IRequestParameters } from "./net/gateway-dvote"
import { BackendApiName, GatewayApiName } from "./models/gateway"
import { Contract, ContractInterface, providers, Signer, utils, Wallet } from "ethers"
import { IEnsPublicResolverContract, IGenesisContract, INamespacesContract, IProcessesContract, IResultsContract, ITokenStorageProofContract } from "./net/contracts"

// TYPES

export type HexString = string
export type ContractAddress = HexString     // e.g. 0x1234567890123456789012345678901234567890

export type MultiLanguage<T> = {
    default: T
    [lang: string]: T                // Indexed by language  { en: value, fr: value, ... }
}

export type URI = string

export type ContentUriString = string
export type ContentHashedUriString = string
export type MessagingUriString = string

export type VocdoniEnvironment = "prod" | "stg" | "dev"

export type EthNetworkID = "mainnet" | "rinkeby" | "goerli" | "xdai" | "sokol"

// GATEWAY INTERFACES

export interface IGatewayDVoteClient {
    get supportedApis(): (GatewayApiName | BackendApiName)[]

    init(): Promise<any>

    get isReady(): boolean
    get dvoteUri(): string

    sendRequest(requestBody: IRequestParameters, wallet?: Wallet | Signer, params?: { timeout: number }): Promise<DVoteGatewayResponseBody>
}

export interface IGatewayWeb3Client {
    get chainId(): Promise<number>
    get networkId(): Promise<string>
    get provider(): providers.BaseProvider
    get web3Uri(): string
    disconnect(): void

    deploy<CustomContractMethods>(abi: string | (string | utils.ParamType)[] | utils.Interface, bytecode: string,
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