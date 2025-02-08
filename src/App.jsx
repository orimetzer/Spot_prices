import { useEffect, useState } from 'react';
import './App.css';
import { Table } from 'antd';

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

  useEffect(() => {
    filterData();
  }, [searchTerms]);  // Reacting only to searchTerms changes

  const filterData = () => {
    const filtered = data.filter(item =>
      item.region.toLowerCase().includes(searchTerms.region.toLowerCase()) &&
      item.instanceType.toLowerCase().includes(searchTerms.instanceType.toLowerCase()) &&
      item.spotPrice.toString().includes(searchTerms.spotPrice)
    );
    setFilteredData(filtered);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      setSearchTerms(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }
  };
  
  const columns = [
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


  function formatDate(isoDate) {
    const date = new Date(isoDate)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `Spot Prices for day ${year}-${month}-${day} and time ${hours}:${minutes}`;
  }

  // decide what to do with
  const currDate = new Date();
  const formattedDate = formatDate(currDate);

  return (
    <div>
      <div>
        <h1>CloudHiro Full Stack Exam - AWS Spot Prices</h1>
        <h3>Author: Ori Metzer</h3>
        {/* <h1>{timestamp}</h1> */}
      </div>
      <div>
        <p>{message}</p>
      </div>
      <h2>{formattedDate}</h2>
      <button onClick={refreshData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      <div>
        <Table columns={columns} dataSource={filteredData} />
      </div>
      <h2>Steals : Check Out The Best Current Spot Prices For Each Region</h2>
      <div>
        <Table columns={columnsStealsData} dataSource={stealsData} />
      </div>
    </div>
  );
}

export default App;
