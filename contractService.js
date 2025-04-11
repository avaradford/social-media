// src/services/contractService.js
// This file would normally handle real blockchain interactions
// For this project, it's simplified to work with mock data

import Web3 from 'web3';
import FalCoinJSON from '../contracts/FalCoin.json';
import PostManagerJSON from '../contracts/PostManager.json';

class ContractService {
    constructor() {
        this.web3 = null;
        this.falCoinContract = null;
        this.postManagerContract = null;
        this.account = null;
        this.isInitialized = false;
    }

    async init() {
        // For a real project, this would connect to an actual blockchain
        // For now, we just simulate the initialization

        try {
            // Check if we're in a browser environment with MetaMask
            if (window.ethereum) {
                this.web3 = new Web3(window.ethereum);
                console.log("Web3 initialized using window.ethereum");
            }
            // Fallback to local development blockchain
            else {
                const provider = new Web3.providers.HttpProvider(
                    process.env.REACT_APP_WEB3_PROVIDER || 'http://localhost:8545'
                );
                this.web3 = new Web3(provider);
                console.log("Web3 initialized using local provider");
            }

            // Get the network ID
            const networkId = await this.web3.eth.net.getId();
            console.log(`Connected to network ID: ${networkId}`);

            // Initialize contract instances
            this.initializeContracts(networkId);

            // Get user account
            const accounts = await this.web3.eth.getAccounts();
            this.account = accounts[0];
            console.log(`Using account: ${this.account}`);

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error("Failed to initialize Web3:", error);
            return false;
        }
    }

    initializeContracts(networkId) {
        // Initialize FalCoin contract
        if (FalCoinJSON.networks[networkId]) {
            this.falCoinContract = new this.web3.eth.Contract(
                FalCoinJSON.abi,
                FalCoinJSON.networks[networkId].address
            );
            console.log("FalCoin contract initialized");
        } else {
            console.warn("FalCoin contract not deployed on the current network");
        }

        // Initialize PostManager contract
        if (PostManagerJSON.networks[networkId]) {
            this.postManagerContract = new this.web3.eth.Contract(
                PostManagerJSON.abi,
                PostManagerJSON.networks[networkId].address
            );
            console.log("PostManager contract initialized");
        } else {
            console.warn("PostManager contract not deployed on the current network");
        }
    }

    // Helper to ensure initialization
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.init();
        }
    }

    // Return contracts and account
    async getContracts() {
        await this.ensureInitialized();
        return {
            falCoinContract: this.falCoinContract,
            postManagerContract: this.postManagerContract,
            account: this.account
        };
    }
}

// Create a singleton instance
const contractService = new ContractService();

export default contractService;