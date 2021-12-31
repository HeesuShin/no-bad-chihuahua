import axios from 'axios';
import { HuahuaBalanceResponse, HuahuaRewardResponse } from '../models/types';

const baseUrl = 'https://api.chihuahua.wtf';

export const getReward = async (address: string): Promise<HuahuaRewardResponse> => {
  const { data }: { data: HuahuaRewardResponse } = await axios.get(`${baseUrl}/distribution/delegators/${address}/rewards`);
  return data;
};

// it returns uhuahua with no decimal point
export const getBalance = async (address: string): Promise<HuahuaBalanceResponse> => {
  const { data }: { data: HuahuaBalanceResponse } = await axios.get(`${baseUrl}/bank/balances/${address}`);
  return data;
};
