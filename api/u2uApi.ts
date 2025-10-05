import axios, { AxiosInstance } from 'axios';

// U2U Testnet Configuration
export const U2U_TESTNET_CONFIG = {
  chainId: 2484, // U2U Testnet chain ID
  rpcUrl: 'https://rpc-nebulas-testnet.uniultra.xyz',
  explorerUrl: 'https://testnet.u2uscan.xyz',
  name: 'U2U Testnet',
  currency: {
    name: 'U2U',
    symbol: 'U2U',
    decimals: 18,
  },
};

// Create axios instance for U2U RPC calls
const u2uRpcClient: AxiosInstance = axios.create({
  baseURL: U2U_TESTNET_CONFIG.rpcUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// U2U API functions
export const u2uApi = {
  
  /**
   * Get the current block number
   */
  getBlockNumber: async (): Promise<string> => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Get balance of an address
   */
  getBalance: async (address: string): Promise<string> => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Get transaction by hash
   */
  getTransaction: async (txHash: string) => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [txHash],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Get transaction receipt
   */
  getTransactionReceipt: async (txHash: string) => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Get gas price
   */
  getGasPrice: async (): Promise<string> => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Estimate gas for a transaction
   */
  estimateGas: async (transaction: {
    from?: string;
    to: string;
    value?: string;
    data?: string;
  }): Promise<string> => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_estimateGas',
      params: [transaction],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Call a contract method (read-only)
   */
  call: async (transaction: {
    to: string;
    data: string;
  }, blockTag: string = 'latest') => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [transaction, blockTag],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Get transaction count (nonce) for an address
   */
  getTransactionCount: async (address: string, blockTag: string = 'latest'): Promise<string> => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: [address, blockTag],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Send raw transaction
   */
  sendRawTransaction: async (signedTx: string): Promise<string> => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [signedTx],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Get logs for events
   */
  getLogs: async (filter: {
    fromBlock?: string;
    toBlock?: string;
    address?: string | string[];
    topics?: (string | string[] | null)[];
  }) => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_getLogs',
      params: [filter],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Get network chain ID
   */
  getChainId: async (): Promise<string> => {
    const response = await u2uRpcClient.post('', {
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1,
    });
    return response.data.result;
  },

  /**
   * Health check for U2U testnet connection
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      await u2uRpcClient.post('', {
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      });
      return true;
    } catch (error) {
      console.error('U2U Testnet health check failed:', error);
      return false;
    }
  },

  /**
   * Utility function to convert hex to decimal
   */
  hexToDecimal: (hex: string): number => {
    return parseInt(hex, 16);
  },

  /**
   * Utility function to convert decimal to hex
   */
  decimalToHex: (decimal: number): string => {
    return `0x${decimal.toString(16)}`;
  },

  /**
   * Format U2U balance from wei to U2U
   */
  formatBalance: (balanceWei: string): string => {
    const balance = BigInt(balanceWei);
    const u2uBalance = Number(balance) / Math.pow(10, 18);
    return u2uBalance.toFixed(6);
  },

  /**
   * Get explorer URL for transaction
   */
  getExplorerTxUrl: (txHash: string): string => {
    return `${U2U_TESTNET_CONFIG.explorerUrl}/tx/${txHash}`;
  },

  /**
   * Get explorer URL for address
   */
  getExplorerAddressUrl: (address: string): string => {
    return `${U2U_TESTNET_CONFIG.explorerUrl}/address/${address}`;
  },
};

export default u2uApi;