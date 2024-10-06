import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function AccountConnected({ account }) {
  return (
    <div>
      <h1>Supply Chain Tracker</h1>
      <p>Account connected: {account}</p>
    </div>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [products, setProducts] = useState([]);
  const [contract, setContract] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      }
    };

    connectWallet();
  }, []);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await fetch('/SupplyChainTracker.json');
        const data = await response.json();
        const web3 = new Web3(window.ethereum);
        const contractInstance = new web3.eth.Contract(data.abi, data.networks.development.address);
        setContract(contractInstance);
      } catch (error) {
        console.error('Error fetching contract data:', error);
      }
    };

    fetchContractData();
  }, []);

  /*const getProducts = async () => {
    try {
      const productCount = await contract.methods.productCount().call();
      console.log(productCount);
      const fetchedProducts = await Promise.all(
        Array.from({ length: productCount }, (_, i) => contract.methods.products(i).call())
      );

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };*/

  const getProducts = async () => {
    try {
      const productCount = await contract.methods.productCount().call();
      console.log('Product Count:', productCount.toString());
      
      const fetchedProducts = [];
      for (let i = 0; i < Number(productCount); i++) {
        const product = await contract.methods.products(i).call();
        console.log(product.manufacturer);
        fetchedProducts.push(product);
      }

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const productName = form.productName.value;
    const productSerialNumber = form.productSerialNumber.value;
    const productCurrentLocation = form.productCurrentLocation.value;
    const isForSale = form.isForSale.value === 'true';
    const initialPrice = Web3.utils.toWei(form.initialPrice.value, 'ether');

console.log(initialPrice);

    try {
      await contract.methods.addProduct(
        productName,
        account,
        productSerialNumber,
        account,
        productCurrentLocation,
        initialPrice,
        isForSale
      ).send({ from: account, gasPrice: '20000000000' });
      console.log('Product added successfully');
      getProducts(); // Refresh the product list
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedProductId || !newOwnerAddress || !price) {
      console.error('Please fill all fields for transfer');
      return;
    }

    try {
      const priceInWei = Web3.utils.toWei(price, 'ether');
      await contract.methods.transferOwnership(selectedProductId, newOwnerAddress)
        .send({ from: account, value: priceInWei });
      console.log('Ownership transferred successfully');
      getProducts(); // Refresh the product list
    } catch (error) {
      console.error('Error transferring ownership:', error);
    }
  };

  return (
    <div>
      <AccountConnected account={account} />
      
      <form onSubmit={addProduct}>
        <label htmlFor="productName">Product Name:</label>
        <input type="text" id="productName" name="productName" required />
        <br />
        <label htmlFor="productSerialNumber">Serial Number:</label>
        <input type="text" id="productSerialNumber" name="productSerialNumber" required />
        <br />
        <label htmlFor="productCurrentLocation">Current location:</label>
        <input type="text" id="productCurrentLocation" name="productCurrentLocation" required />
        <br />
        <label htmlFor="isForSale">For sale:</label>
        <select id="isForSale" name="isForSale">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        <br />
        <label htmlFor="initialPrice">Initial price (ETH):</label>
        <input type="number" id="initialPrice" name="initialPrice" step="0.01" required />
        <br />
        <button type="submit">Add Product</button>
      </form>

      <button onClick={getProducts}>Get Products</button>
      <ul>
        {products.map((product, index) => (
          <li key={index}>
            Manufacturer: {product.manufacturer} - 
            ID: {product.id} -
            Product: {product.name} - 
            Serial number: {product.serialNumber} - 
            Current Owner: {product.currentOwner} - 
            Current Location: {product.currentLocation} - 
            Price: {product.price} ETH - 
            For Sale: {product.isForSale}
          </li>
        ))}
      </ul>

      <div>
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
          <option value="">Select product</option>
          {products.map((product, index) => (
            <option key={index} value={product.id}>{product.name}</option>
          ))}
        </select>
        <input 
          type="number" 
          placeholder="Price (ETH)" 
          step="0.01"
          value={price} 
          onChange={(e) => setPrice(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="New owner address" 
          value={newOwnerAddress} 
          onChange={(e) => setNewOwnerAddress(e.target.value)} 
        />
        <button onClick={handleTransferOwnership}>Transfer Ownership</button>
      </div>
    </div>
  );
}

export default App;