import { ethers } from 'hardhat'
import config from '../src/config.json'

const tokens = (value: number) => {
    return ethers.parseUnits(value.toString(), 'ether');
}

const wait = (seconds: number) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const main = async () => {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const feeAccount = accounts[5];

    const { chainId } = await ethers.provider.getNetwork();
    console.log("Using chainId:", chainId);

    const addressOf = (config as any)[chainId.toString()];

    const exchange = await ethers.getContractAt('Exchange', addressOf.exchange);
    console.log(`Exchange fetched: ${await exchange.getAddress()}`);

    const METH = await ethers.getContractAt('Token', addressOf.METH);
    console.log(`METH Token fetched: ${await METH.getAddress()}`);

    const MDAI = await ethers.getContractAt('Token', addressOf.MDAI);
    console.log(`MDAI Token fetched: ${await MDAI.getAddress()}`);

    const MUSDT = await ethers.getContractAt('Token', addressOf.MUSDT);
    console.log(`MUSDT Token fetched: ${await MUSDT.getAddress()}`);

    const user1 = accounts[1];
    const user2 = accounts[2];
    let inititalTokens = tokens(100000);

    // Transfer tokens to user
    await MUSDT.connect(deployer).transfer(user1.address, inititalTokens);
    console.log(`Transferred ${inititalTokens} MUSDT tokens from ${deployer.address} to ${user1.address}`);

    await METH.connect(deployer).transfer(user2.address, inititalTokens);
    console.log(`Transferred ${inititalTokens} METH tokens from ${deployer.address} to ${user2.address}`);

    // Approve tokens to exchange and deposit
    let amount = tokens(10000);
    await MUSDT.connect(user1).approve(addressOf.exchange, amount);
    await exchange.connect(user1).depositToken(addressOf.MUSDT, amount);
    console.log(`Deposited ${amount} MUSDT tokens from ${user1.address}`);

    await METH.connect(user2).approve(addressOf.exchange, amount);
    await exchange.connect(user2).depositToken(addressOf.METH, amount);
    console.log(`Deposited ${amount} METH tokens from ${user2.address}`);

    // User 1 Makes order and cancels it
    let result: any;
    let transaction = await exchange.connect(user1).makeOrder(addressOf.METH, tokens(1), addressOf.MUSDT, tokens(10));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`)

    let orderId = result?.logs[0].args[0];
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}`)

    await wait(0.5)

    // User 1 Makes order and user2 fills it
    for (let i = 1; i <= 3; i++) {
        transaction = await exchange.connect(user1).makeOrder(addressOf.METH, tokens(1 * i), addressOf.MUSDT, tokens(10 * i))
        result = await transaction.wait()
        console.log(`Made order from ${user1.address}`)

        orderId = result?.logs[0].args[0];
        transaction = await exchange.connect(user2).fillOrder(orderId)
        result = await transaction.wait()
        console.log(`Filled order from ${user1.address}`)
        await wait(0.5)

        console.log(`Fee Account balance: ${await exchange.balanceOf(addressOf.METH, feeAccount.address)}`);
    }

    // User 1 Makes order
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user1).makeOrder(addressOf.METH, tokens(10), addressOf.MUSDT, tokens(100 * i))
        result = await transaction.wait()
        console.log(`Made order from ${user1.address}`)
        await wait(0.5)
    }

    // User 2 Makes order
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(addressOf.MUSDT, tokens(100 * i), addressOf.METH, tokens(10))
        result = await transaction.wait()
        console.log(`Made order from ${user2.address}`)
        await wait(0.5)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });