import { Wallet } from 'ethers';
const { ethers } = require('hardhat');

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    const apiKey = process.env.API_KEY;

    const provider = new ethers.providers.AlchemyProvider('rinkeby', apiKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    const jenie = '0x796b0F208480a7bEa455B3154D4fEAA40E5C1215';

    const response = await cancelListingsOpenSea(wallet, jenie);
    console.log(response);
}

async function cancelListingsOpenSea(wallet: Wallet, contractAddress: string) {
    const abi = [
        {
            inputs: [
                {
                    components: [
                        { internalType: 'address[7]', name: 'addrs', type: 'address[7]' },
                        { internalType: 'uint256[9]', name: 'uints', type: 'uint256[9]' },
                        { internalType: 'uint8', name: 'feeMethod', type: 'uint8' },
                        { internalType: 'uint8', name: 'side', type: 'uint8' },
                        { internalType: 'uint8', name: 'saleKind', type: 'uint8' },
                        { internalType: 'uint8', name: 'howToCall', type: 'uint8' },
                        { internalType: 'bytes', name: 'calldataOrder', type: 'bytes' },
                        { internalType: 'bytes', name: 'replacementPattern', type: 'bytes' },
                        { internalType: 'bytes', name: 'staticExtradata', type: 'bytes' },
                        { internalType: 'uint8', name: 'v', type: 'uint8' },
                        { internalType: 'bytes32', name: 'r', type: 'bytes32' },
                        { internalType: 'bytes32', name: 's', type: 'bytes32' }
                    ],
                    internalType: 'struct OpenSeaBatchCanceller.OpenSeaCancelOrder[]',
                    name: 'orders',
                    type: 'tuple[]'
                },
                { internalType: 'bool', name: 'revertIfFailure', type: 'bool' }
            ],
            name: 'batchCancel',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function'
        }
    ];

    const data = [
        generateCancelOrder(
            contractAddress,
            '0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A',
            '0x23B872DD000000000000000000000000ADD287E6D0213E662D400D815C481B4B2DDE5D6500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000119',
            '1641757879',
            '59504249314248516496291968487653166556038334243377297502884016769846025253580'
        ),
        generateCancelOrder(
            contractAddress,
            '0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A',
            '0x23B872DD000000000000000000000000ADD287E6D0213E662D400D815C481B4B2DDE5D6500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000749',
            '1641757879',
            '59504249314248516496291968487653166556038334243377297502884016769846025253580'
        ),
        generateCancelOrder(
            contractAddress,
            '0xcc14dd8e6673fee203366115d3f9240b079a4930',
            '0x23B872DD000000000000000000000000ADD287E6D0213E662D400D815C481B4B2DDE5D650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000056F',
            '1641757879',
            '59504249314248516496291968487653166556038334243377297502884016769846025253580'
        )
    ];
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    return await contract.batchCancel(data, true);
}

function generateCancelOrder(jenie: string, tokenAddress: string, _callData: string, _listingTime: string, _salt: string) {
    const addrs = ['0x5206e78b21ce315ce284fb24cf05e0585a93b1d9', jenie, '0x0000000000000000000000000000000000000000', '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073', tokenAddress, '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'];

    const howToCall = 0;
    const feeMethod = 1;
    const side = 1;
    const saleKind = 0;
    const replacementPattern = '0x000000000000000000000000000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000000000000000000000000000000000000000000000000000';
    const staticExtradata = '0x';
    const v = 0;
    const r = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const s = '0x0000000000000000000000000000000000000000000000000000000000000000';

    const uints = [250, 0, 0, 0, '1000000000000000000', 0, _listingTime, 0, _salt];

    return [addrs, uints, feeMethod, side, saleKind, howToCall, _callData, replacementPattern, staticExtradata, v, r, s];
}

main();
