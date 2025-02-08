import { useEffect, useState } from 'react';
import './App.css';
import { Table } from 'antd';
// import 'antd/dist/antd.css'; // Import Ant Design CSS


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
        // Refresh the page after successful data refresh
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
          timestamp: item.timestamp
        }));
        setData(formattedData);
        setFilteredData(formattedData);  // Directly setting filteredData here

      })
      .catch(error => console.error('Failed to fetch data:', error));
  }, []);


  const filterData = () => {
    const filtered = data.filter(item =>
      item.region.toLowerCase().includes(searchTerms.region.toLowerCase()) &&
      item.instanceType.toLowerCase().includes(searchTerms.instanceType.toLowerCase()) &&
      item.spotPrice.toString().includes(searchTerms.spotPrice)
    );
    setFilteredData(filtered);
  };

  const handleSearchChange = (value, field) => {
    setSearchTerms(prev => ({ ...prev, [field]: value }));
    filterData();
  };

  const columns = [
    {
      title: (
        <>
          Region 
          <input 
            value={searchTerms.region} 
            onChange={e => handleSearchChange(e.target.value, 'region')} 
            onClick={e => e.stopPropagation()}  // Prevent sorting when interacting with input
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
            value={searchTerms.instanceType} 
            onChange={e => handleSearchChange(e.target.value, 'instanceType')} 
            onClick={e => e.stopPropagation()}  // Prevent sorting when interacting with input
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
            value={searchTerms.spotPrice} 
            onChange={e => handleSearchChange(e.target.value, 'spotPrice')} 
            onClick={e => e.stopPropagation()}  // Prevent sorting when interacting with input
            placeholder="Search price" 
            style={{ width: '100%' }} 
          />
        </>
      ),
      dataIndex: 'spotPrice',
      sorter: (a, b) => a.spotPrice - b.spotPrice,
    }
  ];

  // function formatTimestamp(timestamp) {
  //   const date = new Date(timestamp);
  //   const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  //   const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  //   return `Date: ${formattedDate} and Time: ${formattedTime}`;
  // }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `Spot Prices for day ${year}-${month}-${day} and time ${hours}:${minutes}`;
  }

  const currDate = new Date();
  const formattedDate = formatDate(currDate);

  return (
    <div>
      <div>
        <h1>Welcome to Ori page</h1>
      </div>
      <div>
      <button onClick={refreshData} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Data'}
      </button>
      <p>{message}</p>
    </div>
 
    <h1>{formattedDate}</h1>
          <div>
      <Table columns={columns} dataSource={filteredData} />
    </div>
    
    </div>
  );
}

export default App;

