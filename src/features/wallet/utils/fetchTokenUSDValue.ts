import axios from 'axios';

import { getURL } from '@/utils/validUrl';

export async function fetchTokenUSDValue(mintAddress: string): Promise<number> {
  try {
    if (!mintAddress) {
      throw new Error('Mint address is required');
    }

    const { data } = await axios.get(
      `${getURL()}api/wallet/price?mintAddress=${mintAddress}`,
    );

    return data.price;
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
}
