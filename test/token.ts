import { expect } from "chai";
import { ethers } from "hardhat";

describe('Token', () => {
    it('has a name', async () => {
        const tokenContract = await ethers.getContractFactory('Token');
        let token = await tokenContract.deploy();
        const tokenName = await token.name();
        expect(tokenName).equals('UTK');
    })
});