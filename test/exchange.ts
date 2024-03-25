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
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    let exchange: Exchange & { deploymentTransaction(): ContractTransactionResponse; };
    let METH: Token & { deploymentTransaction(): ContractTransactionResponse; };
    let MUSDT: Token & { deploymentTransaction(): ContractTransactionResponse; };

    const feePercent = 10;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        user2 = accounts[3];

        const exchangeContract = await ethers.getContractFactory('Exchange');
        exchange = await exchangeContract.deploy(feeAccount, feePercent);

        const tokenConract = await ethers.getContractFactory('Token');
        METH = await tokenConract.deploy('Mock Ether', 'METH', 1000000);
        MUSDT = await tokenConract.deploy('Mock USDT', 'MUSDT', 1000000);

        const transaction = await METH.connect(deployer).transfer(user1.address, tokens(100));
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
                let transaction = await METH.connect(user1).approve(exchange.getAddress(), amount);
                await transaction.wait();

                transaction = await exchange.connect(user1).depositToken(METH.getAddress(), amount);
                result = await transaction.wait();
            });

            it('tracks the token deposit to exchange', async () => {
                expect(await exchange.balanceOf(METH.getAddress(), user1.address)).to.be.equal(amount);
                expect(await METH.balanceOf(exchange.getAddress())).to.be.equal(amount);
                expect(await METH.balanceOf(user1.address)).to.be.equal(0);
            })

            it('emits an Deposit event', async () => {
                expect(await result?.logs[1].fragment.name).to.be.equal('Deposit');
            })
        });

        describe('Failure', () => {
            it('fails when no tokens are approved', async () => {
                await expect(exchange.connect(user1).depositToken(METH.getAddress(), amount)).to.be.reverted;
            });
        });
    });

    describe('Withdrawing Tokens', () => {
        let amount = tokens(100);
        let result: any;

        describe('Success', () => {
            beforeEach(async () => {
                let transaction = await METH.connect(user1).approve(exchange.getAddress(), amount);
                await transaction.wait();

                transaction = await exchange.connect(user1).depositToken(METH.getAddress(), amount);
                await transaction.wait();

                transaction = await exchange.connect(user1).withdrawlToken(METH.getAddress(), amount);
                result = await transaction.wait();
            });

            it('withdraws the tokens from exchange', async () => {
                expect(await exchange.balanceOf(METH.getAddress(), user1.address)).to.be.equal(0);
                expect(await METH.balanceOf(exchange.getAddress())).to.be.equal(0);
                expect(await METH.balanceOf(user1.address)).to.be.equal(amount);
            })

            it('emits an Deposit event', async () => {
                expect(await result?.logs[1].fragment.name).to.be.equal('Withdraw');
            })
        });

        describe('Failure', () => {
            it('fails for insufficient balances', async () => {
                await expect(exchange.connect(user1).withdrawlToken(METH.getAddress(), amount)).to.be.reverted;
            });
        });
    });

    describe('Checking balances', () => {
        let amount = tokens(100);
        let transaction: ContractTransactionResponse;

        beforeEach(async () => {
            transaction = await METH.connect(user1).approve(exchange.getAddress(), amount);
            await transaction.wait();

            transaction = await exchange.connect(user1).depositToken(METH.getAddress(), amount);
            await transaction.wait();
        });

        it('verifies balance after deposit', async () => {
            expect(await exchange.balanceOf(METH.getAddress(), user1.address)).to.be.equal(amount);
            expect(await METH.balanceOf(exchange.getAddress())).to.be.equal(amount);
            expect(await METH.balanceOf(user1.address)).to.be.equal(0);
        })

        it('verifies balnce after withdraw', async () => {
            transaction = await exchange.connect(user1).withdrawlToken(METH.getAddress(), amount);
            await transaction.wait();

            expect(await exchange.balanceOf(METH.getAddress(), user1.address)).to.be.equal(0);
            expect(await METH.balanceOf(exchange.getAddress())).to.be.equal(0);
            expect(await METH.balanceOf(user1.address)).to.be.equal(amount);
        })
    });

    describe('Making Orders', () => {
        let amount = tokens(100);
        let result: any;

        describe('Success', () => {
            beforeEach(async () => {
                let transaction = await METH.connect(user1).approve(exchange.getAddress(), amount);
                await transaction.wait();

                transaction = await exchange.connect(user1).depositToken(METH.getAddress(), amount);
                await transaction.wait();

                transaction = await exchange.connect(user1).makeOrder(MUSDT.getAddress(), tokens(1), METH.getAddress(), tokens(1));
                result = await transaction.wait();
            });

            it('track the newly created order', async () => {
                expect(await exchange.orderCount()).to.be.equal(1);
            })

            it('emits an Order event', async () => {
                expect(await result?.logs[0].fragment.name).to.be.equal('Order');
            })

        });

        describe('Failure', () => {
            it('fails for insufficient balances', async () => {
                await expect(exchange.connect(user1).makeOrder(MUSDT.getAddress(), tokens(1), METH.getAddress(), tokens(1))).to.be.reverted;
            });
        });
    });

    describe('Order actions', () => {
        let amount = tokens(1);
        let transaction;
        let result: any;

        beforeEach(async () => {
            transaction = await METH.connect(user1).approve(exchange.getAddress(), amount);
            await transaction.wait();
            transaction = await exchange.connect(user1).depositToken(METH.getAddress(), amount);
            await transaction.wait();

            transaction = await MUSDT.connect(deployer).transfer(user2.address, tokens(100));
            await transaction.wait();
            transaction = await MUSDT.connect(user2).approve(exchange.getAddress(), tokens(2));
            await transaction.wait();
            transaction = await exchange.connect(user2).depositToken(MUSDT.getAddress(), tokens(2));
            await transaction.wait();

            transaction = await exchange.connect(user1).makeOrder(MUSDT.getAddress(), amount, METH.getAddress(), amount);
            await transaction.wait();
        });


        describe('Cancelling orders', () => {
            describe('Success', () => {
                beforeEach(async () => {
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    result = await transaction.wait();
                });
                it('updates cancelled orders', async () => {
                    expect(await exchange.orderCancelled(1)).to.be.equal(true);
                })

                it('emits an Cancel event', async () => {
                    expect(await result?.logs[0].fragment.name).to.be.equal('Cancel');
                })
            });

            describe('Failure', () => {
                it('Rejects invalid order ids', async () => {
                    await expect(exchange.connect(user1).cancelOrder(2)).to.be.reverted;
                });

                it('Rejects unauthorized cancellations', async () => {
                    await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
                });
            });
        });

        describe('Filling orders', () => {
            describe('Success', () => {
                beforeEach(async () => {
                    transaction = await exchange.connect(user2).fillOrder(1);
                    result = await transaction.wait();
                });

                it('Executes the trade and charge fees', async () => {
                    expect(await exchange.balanceOf(MUSDT.getAddress(), user1.address)).to.be.equal(amount);
                    expect(await exchange.balanceOf(METH.getAddress(), user1.address)).to.be.equal(0);

                    expect(await exchange.balanceOf(MUSDT.getAddress(), user2.address)).to.be.equal(tokens(0.9));
                    expect(await exchange.balanceOf(METH.getAddress(), user2.address)).to.be.equal(amount);

                    expect(await exchange.balanceOf(MUSDT.getAddress(), feeAccount.address)).to.be.equal(tokens(0.1));
                })

                it('emits an Trade event', async () => {
                    expect(await result?.logs[0].fragment.name).to.be.equal('Trade');
                })

                it('updates filled orders', async () => {
                    expect(await exchange.orderFilled(1)).to.be.equal(true);
                })
            });

            describe('Failure', () => {
                it('Rejects invalid order ids', async () => {
                    await expect(exchange.connect(user2).fillOrder(2)).to.be.reverted;
                });

                it('Rejects already filled orders', async () => {
                    transaction = await exchange.connect(user2).fillOrder(1);
                    result = await transaction.wait();
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
                });

                it('Rejects already cancelled orders', async () => {
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    result = await transaction.wait();
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
                });
            });
        });
    });
});