import { expect } from "chai";
import { ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";
import { Token } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe('Token', () => {
    let token: Token & { deploymentTransaction(): ContractTransactionResponse; };
    let deployer: HardhatEthersSigner;

    describe('Deployment', () => {
        const name = 'testToken';
        const symbol = 'TTK';
        const decimals = 18;
        const totalSupply = ethers.parseUnits('1000000', 'ether');

        beforeEach(async () => {
            const tokenContract = await ethers.getContractFactory('Token');
            token = await tokenContract.deploy(name, symbol, 1000000);

            const accounts = await ethers.getSigners();
            deployer = accounts[0];
        });

        it('has correct name', async () => {
            expect(await token.name()).equals(name);
        })

        it('has correct symbol', async () => {
            expect(await token.symbol()).equals(symbol);
        })

        it('has correct decimals', async () => {
            expect(await token.decimals()).equals(decimals);
        })

        it('has correct total supply', async () => {
            expect(await token.totalSupply()).equals(totalSupply);
        })

        it('assign total supply to the deployer', async () => {
            expect(await token.balanceOf(deployer.address)).equals(totalSupply);
        })
    });
});