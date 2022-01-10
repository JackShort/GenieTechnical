import { Wallet } from 'ethers';
const { ethers } = require('hardhat');

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    const apiKey = process.env.API_KEY;

    const provider = new ethers.providers.AlchemyProvider('rinkeby', apiKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    const jenie = '0x796b0F208480a7bEa455B3154D4fEAA40E5C1215';

    // approvals
    const dinoContract = '0xcC14dd8E6673fEE203366115D3f9240b079a4930';
    const clonexContract = '0x3eC9C3cB29Ed95A396A48a4fBDb6b8546d001D5A';
    const response = await approveContract(wallet, dinoContract, jenie);
    console.log(response);
    const response2 = await approveContract(wallet, clonexContract, jenie);
    console.log(response2);
}

async function approveContract(wallet: Wallet, contractAddress: string, operatorContract: string) {
    const abi = ['function setApprovalForAll(address _operator, bool _approved) external', 'function isApprovedForAll(address _owner, address _operator) external view returns (bool)'];
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    console.log('Approval transaction:', await contract.setApprovalForAll(operatorContract, true));

    return await contract.isApprovedForAll(wallet.address, operatorContract);
}

main();
