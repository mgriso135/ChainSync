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
        const contractAddress = data.networks.development.address; // Replace with correct network

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
      console.log(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addProduct = async (productName, productSerialNumber, productCurrentLocation) => {
    try {
      const manufacturerAddress = Web3.utils.toChecksumAddress(account);
      console.log(account + " " + productName + " " + productSerialNumber + " from " + account + "\n" + typeof(manufacturerAddress) + " " + typeof(productName));
      await contract.methods.addProduct(productName, manufacturerAddress, productSerialNumber, manufacturerAddress, productCurrentLocation).send({ from: account, gasPrice: '20000000000' });
      console.log('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    //const productManufacturer = e.target.productManufacturer.value;
    const productName = e.target.productName.value;
    const productSerialNumber = e.target.productSerialNumber.value;
    const productCurrentLocation = e.target.productCurrentLocation.value;
    addProduct(productName, productSerialNumber, productCurrentLocation);
  };

  return (
    <div>
      <h1>Supply Chain Tracker</h1>
      <p>Account: {account}</p>
      <button onClick={getProducts}>Get Products</button>
      <form onSubmit={handleAddProduct}>
      <label htmlFor="productManufacturer">Manufacturer:</label>
        <input type="text" id="productManufacturer" name="productManufacturer" required />
        <br />
        <label htmlFor="productName">Product Name:</label>
        <input type="text" id="productName" name="productName" required />
        <br />
        <label htmlFor="productSerialNumber">Serial Number:</label>
        <input type="text" id="productSerialNumber" name="productSerialNumber" required />
        <br />
        <label htmlFor="productCurrentLocation">Current location:</label>
        <input type="text" id="productCurrentLocation" name="productCurrentLocation" required />
        <br />
        <button type="submit">Add Product</button>
      </form>
      <ul>
        {products.map((product, index) => (
          <li key={index}>ID: {product.id.toString(10)} - Product: {product.name} - Manufacturer: {product.manufacturer} - 
          Serial number: {product.serialNumber} - currentOwner: {product.currentOwner}  - currentLocation: {product.currentLocation} </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
