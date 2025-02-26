import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    localhost: {},
  }
};

export default config;
