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

  const addProduct = async (productName, productSerialNumber, productCurrentLocation, isForSale, initialPrice) => {
    try {
      var boolisForSale = false;
      if(isForSale =="true")
        { boolisForSale = true; }
      const manufacturerAddress = Web3.utils.toChecksumAddress(account);
      console.log(account + " " + productName + " " + productSerialNumber + " from " + account + "\n" 
        + isForSale + " " + initialPrice);
      await contract.methods.addProduct(productName, manufacturerAddress, productSerialNumber, manufacturerAddress, productCurrentLocation, initialPrice, boolisForSale).send({ from: account, gasPrice: '20000000000' });
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
    const isForSale = e.target.isForSale.value;
    const initialPrice = e.target.initialPrice.value;
    addProduct(productName, productSerialNumber, productCurrentLocation, isForSale, initialPrice);
  };

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [price, setPrice] = useState('');

  const handleTransferOwnership = async () => {
    console.log(selectedProductId + " " + newOwnerAddress + " " + price);
    try {
      await contract.methods.transferOwnership(selectedProductId, newOwnerAddress).send({ from: account, value: price });
      // Update product ownership in local state (optional)
      console.log('Ownership transferred successfully');
    } catch (error) {
      console.error('Error transferring ownership:', error);
    }
  };

  return (
    <div>
      <h1>Supply Chain Tracker</h1>
      <p>Account: {account}</p>
      
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
        <label htmlFor="isForSale">For sale:</label>
        <select id="isForSale">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        <br />
        <label htmlFor="initialPrice">Initial price:</label>
        <input type="number" id="initialPrice" name="initialPrice" required />ETH
        <br />
        <button type="submit">Add Product</button>
      </form>
      <p></p>
      <button onClick={getProducts}>Get Products</button>
      <ul>
        {products.map((product, index) => (
          <li key={index}>ID: {product.id.toString(10)} - Product: {product.name} - Manufacturer: {product.manufacturer} - 
          Serial number: {product.serialNumber} - currentOwner: {product.currentOwner} - currentLocation: {product.currentLocation} - Price: {product.price + " ETH"} - isForSale: {product.isForSale + "   "}</li>
        ))}
      </ul>

      <select onChange={(e) => setSelectedProductId(e.target.value)}>
        <option value="">Select product</option>
        {products.map((product, index) => (
          <option key={index} value={product.id}>{product.name}</option>
        ))}
      </select>
      <input type="number" placeholder="Price" onChange={(e) => setPrice(e.target.value)}  />
      <input type="text" placeholder="New owner address" onChange={(e) => setNewOwnerAddress(e.target.value)} />
      <button onClick={() => handleTransferOwnership(selectedProductId, newOwnerAddress)}>Transfer Ownership</button>
    
      <ShoppingList />
    </div>

    

  );
}

class ShoppingList extends React.Component {
  render() {
    return (
      <div className="shopping-list">
        <h1>Lista della spesa per {this.props.name}</h1>
        <ul>
          <li>Instagram</li>
          <li>WhatsApp</li>
          <li>Oculus</li>
        </ul>
      </div>
    );
  }
}


export default App;
