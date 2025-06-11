import * as nearApi from 'near-api-js';
import { Account, Near } from 'near-api-js';
import { type FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { type ExecutionStatus } from 'near-api-js/lib/providers/provider';
import { type KeyPairString } from 'near-api-js/lib/utils';

import { type Token } from '@/constants/tokenList';

const nearAccount = process.env.NEAR_ACCOUNT || 'nearn-io.near';
const nearAccountPrivateKey = process.env.NEAR_ACCOUNT_PRIVATE_KEY || '';

const keyStore = new nearApi.keyStores.InMemoryKeyStore();
keyStore.setKey(
  'mainnet',
  nearAccount,
  nearApi.KeyPair.fromString(nearAccountPrivateKey as KeyPairString),
);

const jsonProviders = [
  new nearApi.providers.JsonRpcProvider(
    { url: 'https://archival-rpc.mainnet.near.org' }, // RPC URL
    {
      retries: 3, // Number of retries before giving up on a request
      backoff: 2, // Backoff factor for the retry delay
      wait: 200, // Wait time between retries in milliseconds
    }, // Retry options
  ),
];
const provider = new nearApi.providers.FailoverRpcProvider(jsonProviders);

const connectionConfig = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  provider,
  keyStore,
};

const near = new Near(connectionConfig);

export async function getTransactionStatus(
  accountId: string,
  transactionHash: string,
): Promise<FinalExecutionOutcome> {
  const api = await nearApi.connect(connectionConfig);

  const result = await api.connection.provider.txStatusReceipts(
    transactionHash,
    accountId,
    'FINAL',
  );

  return result;
}

export async function getTransactionDate(blockHash: string): Promise<Date> {
  const api = await nearApi.connect(connectionConfig);

  const result = await api.connection.provider.block({ blockId: blockHash });
  // timestamp is in nanoseconds, so we need to convert it to milliseconds
  return new Date(Number(result.header.timestamp) / 1_000_000);
}

export function formatTokenAmount(amount: string, decimals: number): string {
  const [wholePart, decimalPart = ''] = amount.split('.');
  const paddedDecimal = decimalPart.padEnd(decimals, '0');
  return `${wholePart}${paddedDecimal}`;
}

export async function getStorageBalance(
  tokenAddress: string,
  accountId: string,
) {
  const api = await nearApi.connect(connectionConfig);

  const account = new Account(api.connection, accountId);

  const result: { total: string; used: string } | null =
    await account.viewFunction({
      contractId: tokenAddress,
      methodName: 'storage_balance_of',
      args: {
        account_id: accountId,
      },
    });

  return result;
}

export async function createSputnikProposal(
  dao: string,
  description: string,
  token: Token,
  receiver: string,
  amount: string,
) {
  const args = {
    proposal: {
      description,
      kind: {
        Transfer: {
          token_id: token.tokenSymbol === 'NEAR' ? '' : token.mintAddress,
          receiver_id: receiver,
          amount: amount,
        },
      },
    },
  };

  const account = await near.account(nearAccount);

  const daoPolicy: { proposal_bond: string | undefined } =
    await account.viewFunction({
      contractId: dao,
      methodName: 'get_policy',
    });

  const calls: unknown[] = [
    {
      contractId: dao,
      methodName: 'add_proposal',
      args,
      gas: BigInt(300000000000000),
      attachedDeposit: BigInt(daoPolicy.proposal_bond || 0),
    },
  ];

  if (!(await getStorageBalance(token.mintAddress, receiver))) {
    const depositInYocto = BigInt(125) * BigInt(10) ** BigInt(21);

    calls.push({
      contractId: token.mintAddress,
      methodName: 'storage_deposit',
      args: {
        account_id: receiver,
        registration_only: true,
      },
      gas: BigInt(300000000000000),
      attachedDeposit: depositInYocto,
    });
  }

  const result = await Promise.all(
    calls.map((call) => account.functionCall(call as any)),
  );

  return getProposalId(result[0]!);
}

export async function getProposalId(result: FinalExecutionOutcome) {
  const base64 = (result.receipts_outcome[0]?.outcome.status as ExecutionStatus)
    .SuccessValue;
  const proposalId = Buffer.from(base64!, 'base64').toString('utf-8');
  return proposalId;
}
