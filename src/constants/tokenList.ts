export interface Token {
  tokenName: string;
  tokenSymbol: string;
  mintAddress: string;
  icon: string;
  decimals: number;
  coingeckoSymbol: string;
}

export const ANY_TOKEN: Token = {
  tokenName: 'Any',
  tokenSymbol: 'Any',
  mintAddress: 'any',
  icon: 'https://nearn.io/assets/anyTokens.svg',
  decimals: 6,
  coingeckoSymbol: 'usd-coin',
};

export const OTHER: Token = {
  tokenName: 'Other',
  tokenSymbol: 'Other',
  mintAddress: 'other',
  icon: 'https://nearn.io/assets/anyTokens.svg',
  decimals: 6,
  coingeckoSymbol: 'other',
};

export const FIAT: Token = {
  tokenName: 'Fiat',
  tokenSymbol: 'Fiat',
  mintAddress: 'fiat',
  icon: 'https://nearn.io/assets/anyTokens.svg',
  decimals: 2,
  coingeckoSymbol: 'fiat',
};

export const tokenList: Token[] = [
  {
    tokenName: 'USDC',
    tokenSymbol: 'USDC',
    mintAddress:
      '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
    decimals: 6,
    coingeckoSymbol: 'usd-coin',
  },
  {
    tokenName: 'NEAR',
    tokenSymbol: 'NEAR',
    mintAddress: 'native',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png',
    decimals: 24,
    coingeckoSymbol: 'near',
  },
  {
    tokenName: 'USDT',
    tokenSymbol: 'USDT',
    mintAddress: 'usdt.tether-token.near',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    decimals: 6,
    coingeckoSymbol: 'tether',
  },
  {
    tokenName: 'Aurora',
    tokenSymbol: 'AURORA',
    mintAddress: 'aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14803.png',
    decimals: 18,
    coingeckoSymbol: 'aurora-near',
  },
  {
    tokenName: 'JAMBO',
    tokenSymbol: 'JAMBO',
    mintAddress: 'jambo-1679.meme-cooking.near',
    icon: 'data:image/png;base64,UklGRkQBAABXRUJQVlA4IDgBAAAQCwCdASpgAGAAP9Hm7G+/uDGrJXK6a/A6CUAaCoYIhLv0ee1oBKM5x42N42dKobLDTsCYhGUNkfwDk7QAl88U6nWfZL9Hkpc7IvWpxgrLJU+EnNVkjtdJ0YG297yfkBngAP6uEC0f+KHNncCpfEeBQna1Lmy5IgEMdrIk7crLPNuoYsr/1YQNC0PUUqXW2Co1uRyNcwt6n+b1Ebn1H/DYcSwiUdEaGYZESbbXPbsNff2w8CH5nQeZoccZvUg+8+r4kEuBXXr3/NQFKO8dL9mAcys9Gi8Onp0G7LfrIBb2zpz/cS8zXJQiq1GgYlhjE29ixbMEQ/or5FVV6BduaWxGfHVxoCaF46gYWBBmzIfo3AXWkMnNJETVdxe3j1U4aItDFadMunrOpgGCXuabXV5kpEIEJ4RvgAA=',
    decimals: 18,
    coingeckoSymbol: 'jambo-2',
  },
  ANY_TOKEN,
  FIAT,
  OTHER,
];
