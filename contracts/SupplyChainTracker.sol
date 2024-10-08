// Last modified by Matteo Griso on 08/08/2024

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChainTracker {
    uint256 public productCount;

    mapping(uint256 => Product) public products;
    mapping(uint256 => OwnershipEvent) public ownershipEvents;
    mapping(uint256 => SensorData) public sensorData;

    constructor() {
        productCount = 0;
    }

    struct Product {
        uint256 id;
        string name;
        address manufacturer;
        string serialNumber;
        address currentOwner;
        string currentLocation;
        uint256 timestamp;
        uint256 price;
        bool isForSale;
        uint[] ownershipEventIds;
        uint[] sensorEventIds;
    }

    struct OwnershipEvent {
        address newOwner;
        string newLocation;
        uint256 timestamp;
    }

    struct SensorData {
        uint timestamp;
        uint temperature; // Esempio di dato sensoriale
        string location; // Esempio di dato sensoriale
    }

    function addProduct(
        string memory _name,
        address _manufacturer,
        string memory _serialNumber,
        address _initialOwner,
        string memory _initialLocation,
        uint256 _price,
        bool _isForSale
    ) public {
        require(msg.sender == _manufacturer, "Only manufacturer can add products");

        products[productCount] = Product({
            id: productCount,
            name: _name,
            manufacturer: _manufacturer,
            serialNumber: _serialNumber,
            currentOwner: _initialOwner,
            currentLocation: _initialLocation,
            timestamp: block.timestamp,
            ownershipEventIds: new uint[](0),
            sensorEventIds: new uint[](0),
            price: _price,
            isForSale: _isForSale
        });

        productCount++;
    }


function transferOwnership(uint256 _productId, address _newOwner, string memory _newLocation) public payable {
    // 1. Check if the product exists
    require(_productId < productCount, "Product ID does not exist."); 

    // 2. Check if the sender is the current owner
    require(msg.sender != products[_productId].currentOwner, "Current owner can't buy a from product from himself");

    // 3. Check if the product is actually for sale 
    require(products[_productId].isForSale, "This product is not currently for sale.");

    // 4. Check if the sent value meets or exceeds the product's price
    require(msg.value >= products[_productId].price, "Insufficient payment.");

    // Update product state (if all checks pass)
    // products[_productId].price = msg.value;
    products[_productId].currentOwner = _newOwner;
    products[_productId].currentLocation = _newLocation;

    // Transfer Ether to the previous owner
    payable(products[_productId].currentOwner).transfer(msg.value); 

    // Log the ownership transfer event 
    // uint eventId = generateEventId();
    // ownershipEvents[eventId] = OwnershipEvent(_newOwner, _newLocation, block.timestamp);
    // products[_productId].ownershipEventIds.push(eventId);
}


    // Funzione per generare un ID evento univoco
    uint private eventIdCounter;
    function generateEventId() private returns (uint) {
        eventIdCounter++;
        return eventIdCounter;
    }

    // Funzione per ottenere la storia degli eventi di un prodotto
    function getOwnershipHistory(uint256 _productId) public view returns (OwnershipEvent[] memory) {
        uint[] memory eventIds = products[_productId].ownershipEventIds;
        OwnershipEvent[] memory history = new OwnershipEvent[](eventIds.length);

        for (uint i = 0; i < eventIds.length; i++) {
            history[i] = ownershipEvents[eventIds[i]];
        }

        return history;
    }

    // Funzione per ottenere l'elenco dei prodotti
    function getProducts() public view returns (Product[] memory) {
        Product[] memory history = new Product[](productCount);

        for (uint i = 0; i < productCount; i++) {
            history[i] = products[i];
        }

        return history;
    }

    // Funzione per registrare i dati dei sensori
    function recordSensorData(uint _productId, uint _temperature, string memory _location) public {
        require(msg.sender == products[_productId].currentOwner, "Only the current owner can record sensor data");

        uint eventId = generateEventId();
        sensorData[eventId] = SensorData(block.timestamp, _temperature, _location);
        products[_productId].sensorEventIds.push(eventId);
    }

    // Funzione per ottenere i dati dei sensori di un prodotto
    function getSensorData(uint _productId) public view returns (SensorData[] memory) {
        uint[] memory eventIds = products[_productId].sensorEventIds;
        SensorData[] memory data = new SensorData[](eventIds.length);

        for (uint i = 0; i < eventIds.length; i++) {
            uint index = eventIds[i];
            data[i] = sensorData[index];
        }

        return data;
    }
}

