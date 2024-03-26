import { ethers } from 'hardhat'

const main = async () => {
    const accounts = await ethers.getSigners();
    const feeAccount = accounts[5];

    const TokenContract = await ethers.getContractFactory("Token");
    const ExchangeContract = await ethers.getContractFactory('Exchange');

    const exchange = await ExchangeContract.deploy(feeAccount, 10);
    console.log(`Exchange deployed to: ${await exchange.getAddress()}`);

    const METH = await TokenContract.deploy('Mock Ether', 'METH', 1000000);
    console.log(`METH Token deployed to: ${await METH.getAddress()}`);

    const MDAI = await TokenContract.deploy('Mock DAI', 'MDAI', 1000000);
    console.log(`MDAI Token deployed to: ${await MDAI.getAddress()}`);

    const MUSDT = await TokenContract.deploy('Mock USDT', 'MUSDT', 1000000);
    console.log(`MUSDT Token deployed to: ${await MUSDT.getAddress()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });