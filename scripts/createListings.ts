import { Wallet } from 'ethers';
const { ethers } = require('hardhat');

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    const apiKey = process.env.API_KEY;

    const provider = new ethers.providers.AlchemyProvider('rinkeby', apiKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    const jenie = '0x796b0F208480a7bEa455B3154D4fEAA40E5C1215';

    const response = await createListings(wallet, jenie);
    console.log(response);
}

async function createListings(wallet: Wallet, jenie: string) {
    const abi = [
        {
            inputs: [
                {
                    components: [
                        { internalType: 'address', name: 'tokenAddress', type: 'address' },
                        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
                        { internalType: 'uint256', name: 'priceInWei', type: 'uint256' }
                    ],
                    internalType: 'struct OpenSeaBatchCanceller.ListingInput[]',
                    name: 'tokenListings',
                    type: 'tuple[]'
                },
                { internalType: 'bool', name: 'revertIfFailure', type: 'bool' }
            ],
            name: 'listOrders',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function'
        }
    ];

    const contract = new ethers.Contract(jenie, abi, wallet);
    const listings = [
        ['0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A', '281', '1000000000000000000'],
        ['0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A', '1865', '1000000000000000000'],
        ['0xcC14dd8E6673fEE203366115D3f9240b079a4930', '1391', '1000000000000000000']
    ];

    return await contract.listOrders(listings, true);
}

main();
