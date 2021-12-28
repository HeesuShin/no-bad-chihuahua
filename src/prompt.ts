import inquirer from 'inquirer';
import {
  AuthType,
  authTypeQuestion,
  continueConfirmQuestion,
  mnemonicQuestion,
  privateKeyQuestion,
  TokenType,
  tokenTypeQuestion,
} from './question';

export default async () => {
  const answers = {};
  const { tokenType } = (await inquirer.prompt(tokenTypeQuestion)) as { tokenType: TokenType };
  const { authType } = (await inquirer.prompt(authTypeQuestion)) as { authType: AuthType };
  if (authType === 'mnemonic') {
    const { mnemonic } = (await inquirer.prompt(mnemonicQuestion)) as { mnemonic: string };
    console.log(mnemonic);
    if (!mnemonic) {
      // mnemonic valiation needed
    }
  } else {
    const { privateKey } = (await inquirer.prompt(privateKeyQuestion)) as { privateKey: string };
    if (!privateKey) {
      // mnemonic valiation needed
    }
  }
  const { continueFlag } = (await inquirer.prompt(continueConfirmQuestion)) as { continueFlag: string };
  console.log(continueFlag);
};
