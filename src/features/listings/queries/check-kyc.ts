import { queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api';

export type KycResponse = {
  account_id: string;
  kyc_status: string;
};

export const fetchKyc = async (address: string): Promise<KycResponse> => {
  const { data } = await api.get(
    'https://neardevhub-kyc-proxy.nearn.io/kyc/' + address,
  );
  return data;
};

export const checkKycQuery = (address: string) =>
  queryOptions({
    queryKey: ['kyc', address],
    queryFn: () => fetchKyc(address),
  });
