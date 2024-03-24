import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";
import { Exchange, Token } from "../typechain-types";

const tokens = (value: number) => {
    return ethers.parseUnits(value.toString(), 'ether');
}

describe('Exchange', () => {
    let deployer: HardhatEthersSigner;
    let feeAccount: HardhatEthersSigner;
    let exchange: Exchange & { deploymentTransaction(): ContractTransactionResponse; };
    const feePercent = 10;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        
        const exchangeContract = await ethers.getContractFactory('Exchange');
        exchange = await exchangeContract.deploy(feeAccount, feePercent);
    });

    describe('Deployment', () => {

        it('tracks the fee account', async () => {
            expect(await exchange.feeAccount()).to.be.equal(feeAccount);
        })

        it('tracks the fee percent', async () => {
            expect(await exchange.feePercent()).to.be.equal(feePercent);
        })
    });
});