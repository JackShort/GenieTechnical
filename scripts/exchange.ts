import { Wallet } from 'ethers';
const { ethers } = require('hardhat');

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    const apiKey = process.env.API_KEY;

    const provider = new ethers.providers.AlchemyProvider('rinkeby', apiKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    const jenie = '0x796b0F208480a7bEa455B3154D4fEAA40E5C1215';

    const response = await addExchange(wallet, jenie, '<EXCHANGE ADDRESS HERE>');
    console.log(response);

    const response2 = await getExchange(wallet, jenie, 0);
    console.log(response2);
}

async function addExchange(wallet: Wallet, jenie: string, exchange: string) {
    const abi = [{ inputs: [{ internalType: 'address', name: 'exchange', type: 'address' }], name: 'addExchange', outputs: [], stateMutability: 'nonpayable', type: 'function' }];
    const contract = new ethers.Contract(jenie, abi, wallet);
    return await contract.addExchange(exchange);
}

async function getExchange(wallet: Wallet, jenie: string, exchangeId: number) {
    const abi = [
        {
            inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            name: 'exchanges',
            outputs: [
                { internalType: 'address', name: 'exchange', type: 'address' },
                { internalType: 'bool', name: 'isActive', type: 'bool' }
            ],
            stateMutability: 'view',
            type: 'function'
        }
    ];

    const contract = new ethers.Contract(jenie, abi, wallet);
    return await contract.exchanges(exchangeId);
}

main();
