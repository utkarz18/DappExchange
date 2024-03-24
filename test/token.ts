import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";
import { Token } from "../typechain-types";

const tokens = (value: number) => {
    return ethers.parseUnits(value.toString(), 'ether');
}

describe('Token', () => {
    let token: Token & { deploymentTransaction(): ContractTransactionResponse; };
    let deployer: HardhatEthersSigner;
    let receiver: HardhatEthersSigner
    let totalSupply: bigint;

    describe('Deployment', () => {
        const name = 'testToken';
        const symbol = 'TTK';
        const decimals = 18;
        totalSupply = tokens(1000000);

        beforeEach(async () => {
            const tokenContract = await ethers.getContractFactory('Token');
            token = await tokenContract.deploy(name, symbol, 1000000);

            const accounts = await ethers.getSigners();
            deployer = accounts[0];
            receiver = accounts[1];
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

    describe('Sending Token', () => {
        let amount = tokens(100);
        let result: any;

        describe('Success', () => {
            beforeEach(async () => {
                const transaction = await token.connect(deployer).transfer(receiver.address, amount);
                result = await transaction.wait();
            })

            it('transfer token balances', async () => {
                expect(await token.balanceOf(deployer.address)).equals(totalSupply - amount);
                expect(await token.balanceOf(receiver.address)).equals(amount);
            })

            it('emits a Transfer event', async () => {
                expect(await result?.logs[0].fragment.name).equals('Transfer');
            })
        });

        describe('Failure', () => {
            it('rejects insufficient balances', async () => {
                let invlaidAmount = tokens(1000001);
                await expect(token.connect(deployer).transfer(receiver.address, invlaidAmount)).to.be.revertedWith('Insufficient Balance');
            })

            it('rejects invalid recipent', async () => {
                let amount = tokens(100)
                let zeroAddress = '0x0000000000000000000000000000000000000000'
                await expect(token.connect(deployer).transfer(zeroAddress, amount)).to.be.revertedWith('Invalid Recipent');
            })
        });
    });
});