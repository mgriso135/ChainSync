import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function App() {
  const [account, setAccount] = useState('');
  const [products, setProducts] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      }
    };

    connectWallet();
  }, []);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await fetch('/SupplyChainTracker.json');
        const data = await response.json();
        const abi = data.abi;
        const contractAddress = data.networks.development.address; // Sostituisci con il nome corretto della rete

        const web3 = new Web3(window.ethereum);
        const contractInstance = new web3.eth.Contract(abi, contractAddress);
        setContract(contractInstance);
      } catch (error) {
        console.error('Error fetching contract data:', error);
      }
    };

    fetchContractData();
  }, []);

  const getProducts = async () => {
    try {
        const productCount = await contract.methods.productCount().call();
        const products = [];
  
        for (let i = 0; i < productCount; i++) {
          const product = await contract.methods.products(i).call();
          products.push(product);
        }
  
        setProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

  const addProduct = async (productData) => {
    // Implement logic to add a product to the contract
    // Example:
    // await contract.methods.addProduct(productData).send({ from: account });
  };

  return (
    <div>
      <h1>Supply Chain Tracker</h1>
      <p>Account: {account}</p>
      <button onClick={getProducts}>Get Products</button>
      {/* Add form or other elements for adding products */}
      {/* Display products */}
    </div>
  );
}

export default App;
