import Web3 from 'web3';
import SupplyChainTracker from './contracts/SupplyChainTracker.json';

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
const contract = new web3.eth.Contract(SupplyChainTracker.abi, deployedAddress);