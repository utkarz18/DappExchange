import { ethers } from 'hardhat'


async function main() {
    const TokenContract = await ethers.getContractFactory("Token");

    const token = await TokenContract.deploy();
    const address = await token.getAddress();
    console.log(`Token deployed to: ${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });