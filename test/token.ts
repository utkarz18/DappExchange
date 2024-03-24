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
    let exchange: HardhatEthersSigner;
    let totalSupply: bigint;

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
        exchange = accounts[2];
    });

    describe('Deployment', () => {

        it('has correct name', async () => {
            expect(await token.name()).to.be.equal(name);
        })

        it('has correct symbol', async () => {
            expect(await token.symbol()).to.be.equal(symbol);
        })

        it('has correct decimals', async () => {
            expect(await token.decimals()).to.be.equal(decimals);
        })

        it('has correct total supply', async () => {
            expect(await token.totalSupply()).to.be.equal(totalSupply);
        })

        it('assign total supply to the deployer', async () => {
            expect(await token.balanceOf(deployer.address)).to.be.equal(totalSupply);
        })
    });

    describe('Sending Tokens', () => {
        describe('Success', () => {
            let amount = tokens(100);
            let result: any;

            beforeEach(async () => {
                const transaction = await token.connect(deployer).transfer(receiver.address, amount);
                result = await transaction.wait();
            })

            it('transfer token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.be.equal(totalSupply - amount);
                expect(await token.balanceOf(receiver.address)).to.be.equal(amount);
            })

            it('emits a Transfer event', async () => {
                expect(await result?.logs[0].fragment.name).to.be.equal('Transfer');
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
                await expect(token.connect(deployer).transfer(zeroAddress, amount)).to.be.revertedWith('cannot transfer to the zero address');
            })
        });
    });

    describe('Approving Tokens', () => {
        let amount = tokens(100);
        let result: any;

        beforeEach(async () => {
            const transaction = await token.connect(deployer).approve(exchange.address, amount);
            result = await transaction.wait();
        });

        describe('Success', () => {
            it('allocates an allowance for delegated token spending', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(amount);
            })

            it('emits an Approval event', async () => {
                expect(await result?.logs[0].fragment.name).to.be.equal('Approval');
            })
        });

        describe('Failure', () => {
            it('rejects invalid spenders', async () => {
                let amount = tokens(100)
                let zeroAddress = '0x0000000000000000000000000000000000000000'
                await expect(token.connect(deployer).approve(zeroAddress, amount)).to.be.revertedWith('cannot approve zero address');
            })
        });
    });

    describe('Delegated Token Transfers', () => {
        let amount = tokens(100);
        let result: any;

        beforeEach(async () => {
            const transaction = await token.connect(deployer).approve(exchange.address, amount);
            result = await transaction.wait();
        });

        describe('Success', () => {
            beforeEach(async () => {
                const transaction = await token.connect(exchange).transferfrom(deployer.address, receiver.address, amount);
                result = await transaction.wait();
            })
            it('transfer token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.be.equal(totalSupply - amount);
                expect(await token.balanceOf(receiver.address)).to.be.equal(amount);
            })

            it('resets the allowance', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0);
            })

            it('emits a Transfer event', async () => {
                expect(await result?.logs[0].fragment.name).to.be.equal('Transfer');
            })
        });

        describe('Failure', () => {
            it('attempt to transfer tokens beyond approval amount', async () => {
                const amount = tokens(101);
                await expect(token.connect(exchange).transferfrom(deployer.address, receiver.address, amount)).to.be.revertedWith('Exceeds Approval Limit');
            })
        });
    });
});