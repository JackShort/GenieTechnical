import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { network, ethers } from 'hardhat';

describe('JenieBatchCanceller', function () {
    let JenieBatchCanceller;
    let hardhatJenieBatchCancellor: Contract;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;

    const openSeaAddress = '0x5206e78b21Ce315ce284FB24cf05e0585A93B1d9';

    beforeEach(async function () {
        JenieBatchCanceller = await ethers.getContractFactory('JenieBatchCanceller');
        [owner, addr1] = await ethers.getSigners();

        hardhatJenieBatchCancellor = await JenieBatchCanceller.deploy();
    });

    describe('constructor', function () {
        it('Should set the right owner', async function () {
            expect(await hardhatJenieBatchCancellor.owner()).to.equal(owner.address);
        });
    });

    describe('exchanges', function () {
        it('Should add opensea to exchanges and update appropriately', async function () {
            // add opensea to exchanges
            await hardhatJenieBatchCancellor.addExchange(openSeaAddress);

            // check exchanges
            let [exchange, isActive] = await hardhatJenieBatchCancellor.exchanges(0);
            expect(exchange).to.equal(openSeaAddress);
            expect(isActive).to.equal(true);

            // update exchange
            await hardhatJenieBatchCancellor.updateExchange(0, openSeaAddress, false);
            [exchange, isActive] = await hardhatJenieBatchCancellor.exchanges(0);
            expect(exchange).to.equal(openSeaAddress);
            expect(isActive).to.equal(false);

            await hardhatJenieBatchCancellor.updateExchange(0, addr1.address, true);
            [exchange, isActive] = await hardhatJenieBatchCancellor.exchanges(0);
            expect(exchange).to.equal(addr1.address);
            expect(isActive).to.equal(true);
        });

        it('Should fail to not being owner', async function () {
            await expect(hardhatJenieBatchCancellor.connect(addr1).addExchange(openSeaAddress)).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );
            await expect(hardhatJenieBatchCancellor.connect(addr1).updateExchange(0, openSeaAddress, false)).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );
        });
    });

    describe('createAndCancel', function () {
        it('Should list my NFTs then proceed to cancel them', async function () {
            await network.provider.request({
                method: 'hardhat_impersonateAccount',
                params: ['0xaDd287e6d0213e662D400d815C481b4b2ddE5d65']
            });
            const signer = await ethers.getSigner('0xaDd287e6d0213e662D400d815C481b4b2ddE5d65');

            const listings = [
                ['0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A', '281', '1000000000000000000'],
                ['0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A', '1865', '1000000000000000000'],
                ['0xcC14dd8E6673fEE203366115D3f9240b079a4930', '1391', '1000000000000000000']
            ];

            const abi = [
                'function setApprovalForAll(address _operator, bool _approved) external',
                'function isApprovedForAll(address _owner, address _operator) external view returns (bool)'
            ];
            const cloneXContract = new ethers.Contract('0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A', abi, signer);
            const dinoContract = new ethers.Contract('0xcC14dd8E6673fEE203366115D3f9240b079a4930', abi, signer);
            await cloneXContract.setApprovalForAll(hardhatJenieBatchCancellor.address, true);
            await dinoContract.setApprovalForAll(hardhatJenieBatchCancellor.address, true);

            const tx = await hardhatJenieBatchCancellor.connect(signer).listOrders(listings, true);
            const receipt = await tx.wait();
            const logs = receipt.logs;
            expect(logs.length).to.equal(6);
        });
    });
});
