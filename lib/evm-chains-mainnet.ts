import { defineChain } from 'viem'
export const NATIVE_ADDRESS = `0x0000000000000000000000000000000000000000`

export const u2uMainnet = defineChain({
    id: 39,
    name: 'U2U Solaris Mainnet',
    nativeCurrency: { decimals: 18, name: 'U2U', symbol: 'U2U' },
    rpcUrls: {
        default: { http: ['https://rpc-mainnet.u2u.xyz'] },
    },
    blockExplorers: {
        default: { name: 'U2UScan', url: 'https://u2uscan.xyz' },
    },
})

export const u2uTestnet = defineChain({
    id: 2484,
    name: 'Unicorn Ultra Nebulas Testnet',
    nativeCurrency: { decimals: 18, name: 'U2U', symbol: 'U2U' },
    rpcUrls: {
        default: { http: ['https://rpc-nebulas-testnet.u2u.xyz'] },
    },
    blockExplorers: {
        default: { name: 'U2UScan Testnet', url: 'https://testnet.u2uscan.xyz' },
    },
})

export const allMainnetChains = [
    u2uMainnet,
    u2uTestnet
]
