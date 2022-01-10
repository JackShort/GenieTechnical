const { ethers } = require('hardhat');

const privateKey = process.env.PRIVATE_KEY;
const apiKey = process.env.API_KEY;

const provider = new ethers.providers.AlchemyProvider('rinkeby', apiKey);
const wallet = new ethers.Wallet(privateKey, provider);

async function main() {
    const jenie = '0x796b0F208480a7bEa455B3154D4fEAA40E5C1215';
    const response = await generalCancelOrder(jenie);
    console.log(response);
}

async function generalCancelOrder(jenie: string) {
    const abi = [
        {
            inputs: [
                {
                    components: [
                        { internalType: 'uint256', name: 'exchangeId', type: 'uint256' },
                        { internalType: 'bytes', name: 'cancelCalldata', type: 'bytes' }
                    ],
                    internalType: 'struct OpenSeaBatchCanceller.CancelInstruction[]',
                    name: 'instructions',
                    type: 'tuple[]'
                },
                { internalType: 'bool', name: 'revertIfFailure', type: 'bool' }
            ],
            name: 'generalBatchCanceller',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function'
        }
    ];

    const data = [
        generateGeneralCancelOrder(
            jenie,
            '0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A',
            '0x23B872DD000000000000000000000000ADD287E6D0213E662D400D815C481B4B2DDE5D6500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000119',
            '1641781059',
            '58159698899031617159824699735463305511337161182942141042369788557713870781321'
        ),
        generateGeneralCancelOrder(
            jenie,
            '0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A',
            '0x23B872DD000000000000000000000000ADD287E6D0213E662D400D815C481B4B2DDE5D6500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000749',
            '1641781059',
            '58159698899031617159824699735463305511337161182942141042369788557713870781321'
        ),
        generateGeneralCancelOrder(
            jenie,
            '0xcc14dd8e6673fee203366115d3f9240b079a4930',
            '0x23B872DD000000000000000000000000ADD287E6D0213E662D400D815C481B4B2DDE5D650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000056F',
            '1641781059',
            '58159698899031617159824699735463305511337161182942141042369788557713870781321'
        )
    ];

    const contract = new ethers.Contract(jenie, abi, wallet);
    return await contract.generalBatchCanceller(data, true);
}

function generateGeneralCancelOrder(jenie: string, tokenAddress: string, _callData: string, _listingTime: string, _salt: string) {
    const abi = [
        {
            constant: false,
            inputs: [
                { name: 'addrs', type: 'address[7]' },
                { name: 'uints', type: 'uint256[9]' },
                { name: 'feeMethod', type: 'uint8' },
                { name: 'side', type: 'uint8' },
                { name: 'saleKind', type: 'uint8' },
                { name: 'howToCall', type: 'uint8' },
                { name: 'calldata', type: 'bytes' },
                { name: 'replacementPattern', type: 'bytes' },
                { name: 'staticExtradata', type: 'bytes' },
                { name: 'v', type: 'uint8' },
                { name: 'r', type: 'bytes32' },
                { name: 's', type: 'bytes32' }
            ],
            name: 'cancelOrder_',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function'
        }
    ];

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

    const data = [addrs, uints, feeMethod, side, saleKind, howToCall, _callData, replacementPattern, staticExtradata, v, r, s];

    const iface = new ethers.utils.Interface(abi);
    return [0, iface.encodeFunctionData('cancelOrder_', data)];
}

main();
