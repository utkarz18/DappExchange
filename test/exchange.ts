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
    let seller: HardhatEthersSigner;

    let exchange: Exchange & { deploymentTransaction(): ContractTransactionResponse; };
    let token1: Token & { deploymentTransaction(): ContractTransactionResponse; };

    const feePercent = 10;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        seller = accounts[2];

        const exchangeContract = await ethers.getContractFactory('Exchange');
        exchange = await exchangeContract.deploy(feeAccount, feePercent);

        const tokenConract = await ethers.getContractFactory('Token');
        token1 = await tokenConract.deploy('Test coin', 'TTK', 1000000);

        const transaction = await token1.connect(deployer).transfer(seller.address, tokens(100));
        await transaction.wait();
    });

    describe('Deployment', () => {

        it('tracks the fee account', async () => {
            expect(await exchange.feeAccount()).to.be.equal(feeAccount);
        })

        it('tracks the fee percent', async () => {
            expect(await exchange.feePercent()).to.be.equal(feePercent);
        })
    });

    describe('Depositing Tokens', () => {
        let amount = tokens(100);
        let result: any;

        describe('Success', () => {
            beforeEach(async () => {
                let transaction = await token1.connect(seller).approve(exchange.getAddress(), amount);
                await transaction.wait();

                transaction = await exchange.connect(seller).depositToken(token1.getAddress(), amount);
                result = await transaction.wait();
            });

            it('tracks the token deposit to exchange', async () => {
                expect(await exchange.balanceOf(token1.getAddress(), seller.address)).to.be.equal(amount);
                expect(await token1.balanceOf(exchange.getAddress())).to.be.equal(amount);
                expect(await token1.balanceOf(seller.address)).to.be.equal(0);
            })

            it('emits an Deposit event', async () => {
                expect(await result?.logs[1].fragment.name).to.be.equal('Deposit');
            })
        });

        describe('Failure', () => {
            it('fails when no tokens are approved', async () => {
                await expect(exchange.connect(seller).depositToken(token1.getAddress(), amount)).to.be.reverted;
            });
        });
    });

    describe('Withdrawing Tokens', () => {
        let amount = tokens(100);
        let result: any;

        describe('Success', () => {
            beforeEach(async () => {
                let transaction = await token1.connect(seller).approve(exchange.getAddress(), amount);
                await transaction.wait();

                transaction = await exchange.connect(seller).depositToken(token1.getAddress(), amount);
                await transaction.wait();

                transaction = await exchange.connect(seller).withdrawlToken(token1.getAddress(), amount);
                result = await transaction.wait();
            });

            it('withdraws the tokens from exchange', async () => {
                expect(await exchange.balanceOf(token1.getAddress(), seller.address)).to.be.equal(0);
                expect(await token1.balanceOf(exchange.getAddress())).to.be.equal(0);
                expect(await token1.balanceOf(seller.address)).to.be.equal(amount);
            })

            it('emits an Deposit event', async () => {
                expect(await result?.logs[1].fragment.name).to.be.equal('Withdraw');
            })
        });

        describe('Failure', () => {
            it('fails for insufficient balances', async () => {
                await expect(exchange.connect(seller).withdrawlToken(token1.getAddress(), amount)).to.be.reverted;
            });
        });
    });

    describe('Checking balances', () => {
        let amount = tokens(100);
        let transaction: ContractTransactionResponse;

        beforeEach(async () => {
            transaction = await token1.connect(seller).approve(exchange.getAddress(), amount);
            await transaction.wait();

            transaction = await exchange.connect(seller).depositToken(token1.getAddress(), amount);
            await transaction.wait();
        });

        it('verifies balance after deposit', async () => {
            expect(await exchange.balanceOf(token1.getAddress(), seller.address)).to.be.equal(amount);
            expect(await token1.balanceOf(exchange.getAddress())).to.be.equal(amount);
            expect(await token1.balanceOf(seller.address)).to.be.equal(0);
        })

        it('verifies balnce after withdraw', async () => {
            transaction = await exchange.connect(seller).withdrawlToken(token1.getAddress(), amount);
            await transaction.wait();

            expect(await exchange.balanceOf(token1.getAddress(), seller.address)).to.be.equal(0);
            expect(await token1.balanceOf(exchange.getAddress())).to.be.equal(0);
            expect(await token1.balanceOf(seller.address)).to.be.equal(amount);
        })
    });
});