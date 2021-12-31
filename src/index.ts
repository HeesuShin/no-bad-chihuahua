import { mnemonicToSeedSync } from 'bip39';
import { fromSeed } from 'bip32';
import { BN } from 'bn.js';
import schedule from 'node-schedule';

import { convertHexStringToBuffer, createClaimAndDelegateRawTx, getAccount, getClient, sendTx, signTx } from './services/cosmos';
import { COIN_TYPE, GAS_PRICE, SUPPORT_CHAIN_LIST } from './config';
import { getBalance, getReward } from './services/api';
import { ChainInformation } from './models/types';
import prompt from './cli/prompt';

const autoStaking = async (privateKey: Buffer, chainInformation: ChainInformation) => {
  const gasPrice = new BN(GAS_PRICE, 10);
  const client = await getClient(chainInformation.rpcUrl);
  const account = await getAccount(privateKey, chainInformation);
  const reward = await getReward(account.address);
  const balance = await getBalance(account.address);

  const validatorAddress = reward.result.rewards[0].validator_address;

  // it returns uhuahua with decimal point 18
  const rewardAmount = new BN(reward.result.rewards[0].reward[0].amount.replace('.', ''), 10);
  // it returns uhuahua with no decimal point
  const balanceAmount = new BN(`${balance.result[0].amount}${'0'.repeat(18)}`, 10);
  const amount = rewardAmount.add(balanceAmount);
  const scaledAmount = amount.div(new BN(`1${'0'.repeat(18)}`));

  const calculatedAmount = scaledAmount.sub(gasPrice).toString();

  const rawTx = await createClaimAndDelegateRawTx(client, account.address, validatorAddress, calculatedAmount, chainInformation);
  const signedTx = await signTx(privateKey, rawTx, chainInformation);
  const result = await sendTx(client, signedTx);
  console.log(`scaledAmount: ${scaledAmount}`);
  console.log(`calculatedAmount: ${calculatedAmount}`);
};

const run = async () => {
  const { chainType, authType, authString, continueFlag } = await prompt();
  const selectedChainInformation: ChainInformation | undefined = SUPPORT_CHAIN_LIST.find((chain) => chain.ticker === chainType);

  if (selectedChainInformation === undefined) {
    return;
  }

  // validation check, should remove authType after privateKey supported
  if (continueFlag) {
    let privateKey: Buffer;

    if (authType === 'mnemonic') {
      const seed = mnemonicToSeedSync(authString);
      const node = fromSeed(seed);

      const child = node.derivePath(`m/44'/${COIN_TYPE}'/0'/0/0`);
      if (child.privateKey !== undefined) {
        privateKey = child.privateKey;
      }
    } else {
      privateKey = convertHexStringToBuffer(authString.startsWith('0x') ? authString.slice(2) : authString);
    }

    schedule.scheduleJob('*/10 * * * *', async () => {
      await autoStaking(privateKey, selectedChainInformation);
    });
  }
};

run();
