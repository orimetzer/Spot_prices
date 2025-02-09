import { useEffect, useState } from 'react';
import './App.css';
import { Table } from 'antd';


/**
 * App Component Description
 * 
 * The App component serves as the main interface for displaying AWS spot price data and "steals".
 * It fetches data from a backend server, allows user to initiate and refresh data and supports basic
 * filtering of the spot price data based on user input.
 *
 * State Management:
 * - `data` stores the raw spot price data.
 * - `filteredData` holds the data filtered according to user input.
 * - `stealsData` contains the best prices per region.
 * - `loading` indicates whether the data is currently being fetched.
 * - `message` displays status messages (errors, loading, etc.).
 * - `searchTerms` tracks the user's filter inputs.
 *
 * Hooks Used:
 * - `useEffect` to fetch data on component mount and handle side effects of search term updates.
 * - `useState` to manage local state including data, loading status, and search terms.
 *
 * API Interactions:
 * - Fetches data from `/api/spot_prices` and `/api/best_prices` endpoints.
 * - Sends requests to `/api/refresh_data` to trigger data refresh on the server.
 *
 * User Interactions:
 * - Users can type into filter input fields and press 'Enter' to filter the spot price data.
 * - Users can click on a column name to trigger a sorting operation.
 * - Users can click the 'Refresh Data' button to reload data from the backend.
 */

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerms, setSearchTerms] = useState({
    region: '',
    instanceType: '',
    spotPrice: '',
  });
  const [stealsData, setStealsData] = useState([]);
  

  // Refresh data from the backend
  const refreshData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/refresh_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then(data => {
      setMessage(data.status);
      setLoading(false);
      if (data.success) {
        window.location.reload();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setMessage('Data extraction failed');
      setLoading(false);
    });
  };

  // Fetch spot prices
  useEffect(() => {
    fetch('http://localhost:5000/api/spot_prices')
      .then(response => response.json())
      .then(data => {
        const formattedData = data.map((item, index) => ({
          key: index,
          region: item.region,
          instanceType: item.instance_type,
          spotPrice: item.spot_price,
        }));
        setData(formattedData);
        setFilteredData(formattedData);  // Assuming you want to initially display all data
      })
      .catch(error => console.error('Failed to fetch data:', error));
  }, []);


  // Fetch best prices for Steals section
  useEffect(() => {
    fetch('http://localhost:5000/api/best_prices')
      .then(response => response.json())
      .then(data => {
        const formattedSteaslData = data.map((item, index) => ({
          key: index,
          region: item.region,
          instanceType: item.instance_type,
          spotPrice: item.spot_price,
        }));
        setStealsData(formattedSteaslData);
      })
      .catch(error => console.error('Failed to fetch steals data:', error));
  }, []);

  // Filter data based on search terms
  useEffect(() => {
    const filterData = () => {
      const filtered = data.filter(item =>
        item.region.toLowerCase().includes(searchTerms.region.toLowerCase()) &&
        item.instanceType.toLowerCase().includes(searchTerms.instanceType.toLowerCase()) &&
        item.spotPrice.toString().includes(searchTerms.spotPrice)
      );
      setFilteredData(filtered);
    };
    filterData();
  }, [searchTerms, data]); 



  // Updates the displayed table once the Enter button is pressed from a search box
  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      setSearchTerms(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }
  };

  // Column definitions for the main table
  const columnsMainTable = [
    {
      title: (
        <>
          Region 
          <input 
            defaultValue={searchTerms.region} 
            onKeyDown={e => handleKeyDown(e, 'region')} 
            onClick={e => e.stopPropagation()} 
            placeholder="Search region" 
            style={{ width: '100%' }} 
          />
        </>
      ),
      dataIndex: 'region',
      sorter: (a, b) => a.region.localeCompare(b.region),
    },
    {
      title: (
        <>
          Instance Type 
          <input 
            defaultValue={searchTerms.instanceType} 
            onKeyDown={e => handleKeyDown(e, 'instanceType')} 
            onClick={e => e.stopPropagation()} 
            placeholder="Search instance" 
            style={{ width: '100%' }} 
          />
        </>
      ),
      dataIndex: 'instanceType',
      sorter: (a, b) => a.instanceType.localeCompare(b.instanceType),
    },
    {
      title: (
        <>
          Spot Price 
          <input 
            defaultValue={searchTerms.spotPrice} 
            onKeyDown={e => handleKeyDown(e, 'spotPrice')} 
            onClick={e => e.stopPropagation()} 
            placeholder="Search price" 
            style={{ width: '100%' }} 
          />
        </>
      ),
      dataIndex: 'spotPrice',
      sorter: (a, b) => a.spotPrice - b.spotPrice,
    }
  ];

  // Column definitions for the Steals table
  const columnsStealsData = [
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'Instance Type',
      dataIndex: 'instanceType',
      key: 'instanceType',
    },
    {
      title: 'Spot Price',
      dataIndex: 'spotPrice',
      key: 'spotPrice',
    }
  ];



  return (
    <div>
      <div>
        <h1>CloudHiro Full Stack Exam - AWS Spot Prices</h1>
        <h3>Author: Ori Metzer</h3>
      </div>
      <div>
        <p>{message}</p>
      </div>
      <h2>Current Spot Prices of AWS</h2>
      <h3>For a first load or for refreshing the data, click the refresh button</h3>

      <button onClick={refreshData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      <div>
        <Table columns={columnsMainTable} dataSource={filteredData} />
      </div>
      <h2>Steals : Check Out The Best Current Spot Prices For Each Region</h2>
      <div>
        <Table columns={columnsStealsData} dataSource={stealsData} />
      </div>
    </div>
  );
}

export default App;