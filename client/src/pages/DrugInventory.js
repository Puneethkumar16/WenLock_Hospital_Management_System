import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Badge, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDrugs as getDrugs, updateDrugStock as updateDrug } from '../redux/slices/pharmacySlice';
import Chart from 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';

const DrugInventory = () => {
  const dispatch = useDispatch();
  const { drugs, loading, error } = useSelector((state) => state.pharmacy);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState(0);
  
  useEffect(() => {
    dispatch(getDrugs());
  }, [dispatch]);
  
  // Handle stock update (add or remove quantity)
  const handleUpdateStock = (drug, quantity) => {
    if (quantity === 0) return;
    
    const newStock = drug.currentStock + quantity;
    if (newStock < 0) {
      alert('Cannot remove more than current stock');
      return;
    }
    
    dispatch(updateDrug({
      id: drug._id,
      drugData: { currentStock: newStock }
    }))
      .unwrap()
      .catch(err => {
        console.error('Error updating drug stock:', err);
      });
  };
  
  // Status filters for inventory
  const statusFilters = {
    all: drug => true,
    inStock: drug => drug.currentStock > drug.minStock,
    lowStock: drug => drug.currentStock > 0 && drug.currentStock <= drug.minStock,
    outOfStock: drug => drug.currentStock <= 0,
    expiringSoon: drug => {
      if (!drug.expiryDate) return false;
      const expiryDate = new Date(drug.expiryDate);
      const today = new Date();
      const monthFromNow = new Date();
      monthFromNow.setMonth(today.getMonth() + 1);
      return expiryDate <= monthFromNow && expiryDate >= today;
    },
    expired: drug => {
      if (!drug.expiryDate) return false;
      const expiryDate = new Date(drug.expiryDate);
      const today = new Date();
      return expiryDate < today;
    }
  };
  
  // Get stock status badge
  const getStockStatus = (current, min) => {
    if (current <= 0) return { status: 'Out of Stock', variant: 'danger' };
    if (current <= min) return { status: 'Low Stock', variant: 'warning' };
    return { status: 'In Stock', variant: 'success' };
  };
  
  // Apply filters and sort
  const getFilteredDrugs = () => {
    return drugs
      .filter(drug => 
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drug.genericName && drug.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (drug.manufacturer && drug.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(statusFilters[filterStatus])
      .sort((a, b) => {
        let valA, valB;
        
        switch (sortBy) {
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'stock':
            valA = a.currentStock;
            valB = b.currentStock;
            break;
          case 'price':
            valA = a.price || 0;
            valB = b.price || 0;
            break;
          case 'expiry':
            valA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
            valB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
            break;
          default:
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        }
        
        if (sortDir === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  };
  
  // Get categories for chart
  const getCategories = () => {
    const categories = {};
    drugs.forEach(drug => {
      if (drug.category) {
        if (!categories[drug.category]) categories[drug.category] = 0;
        categories[drug.category]++;
      }
    });
    return categories;
  };
  
  // Get stock status data for chart
  const getStockStatusData = () => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    
    drugs.forEach(drug => {
      if (drug.currentStock <= 0) {
        outOfStock++;
      } else if (drug.currentStock <= drug.minStock) {
        lowStock++;
      } else {
        inStock++;
      }
    });
    
    return { inStock, lowStock, outOfStock };
  };
  
  const categories = getCategories();
  const stockStatusData = getStockStatusData();
  const filteredDrugs = getFilteredDrugs();
  
  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Drug Inventory Management</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item">
          <a href="/pharmacy">Pharmacy</a>
        </li>
        <li className="breadcrumb-item active">Inventory</li>
      </ol>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col lg={9}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-warehouse me-1"></i>
                Drug Inventory
              </div>
              <Button variant="primary" onClick={() => window.location.href = '/pharmacy'}>
                <i className="fas fa-plus me-1"></i>
                Add New Drug
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search drugs..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                
                <Col md={3}>
                  <Form.Select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Items</option>
                    <option value="inStock">In Stock</option>
                    <option value="lowStock">Low Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                    <option value="expiringSoon">Expiring Soon</option>
                    <option value="expired">Expired</option>
                  </Form.Select>
                </Col>
                
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>Sort By</InputGroup.Text>
                    <Form.Select 
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                    >
                      <option value="name">Name</option>
                      <option value="stock">Stock Level</option>
                      <option value="price">Price</option>
                      <option value="expiry">Expiry Date</option>
                    </Form.Select>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                    >
                      <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'}`}></i>
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
              
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredDrugs.length === 0 ? (
                <Alert variant="info">
                  No drugs match your current filters
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Min. Stock</th>
                        <th>Price</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDrugs.map(drug => {
                        const stockStatus = getStockStatus(drug.currentStock, drug.minStock);
                        
                        return (
                          <tr key={drug._id}>
                            <td>
                              <strong>{drug.name}</strong>
                              {drug.genericName && (
                                <div>
                                  <small className="text-muted">{drug.genericName}</small>
                                </div>
                              )}
                            </td>
                            <td>{drug.category || 'N/A'}</td>
                            <td>{drug.currentStock}</td>
                            <td>{drug.minStock}</td>
                            <td>₹{drug.price?.toFixed(2) || '0.00'}</td>
                            <td>
                              {drug.expiryDate
                                ? new Date(drug.expiryDate).toLocaleDateString()
                                : 'N/A'}
                            </td>
                            <td>
                              <Badge bg={stockStatus.variant}>
                                {stockStatus.status}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => {
                                    setSelectedDrug(drug);
                                    setQuantityToAdd(1);
                                  }}
                                >
                                  <i className="fas fa-plus"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDrug(drug);
                                    setQuantityToAdd(-1);
                                  }}
                                >
                                  <i className="fas fa-minus"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <strong>Total Items:</strong> {filteredDrugs.length} of {drugs.length}
                </div>
                
                {selectedDrug && (
                  <div className="d-flex align-items-center">
                    <span className="me-2">Adjust stock for <strong>{selectedDrug.name}</strong>:</span>
                    <Form.Control
                      type="number"
                      value={quantityToAdd}
                      onChange={e => setQuantityToAdd(parseInt(e.target.value) || 0)}
                      className="me-2"
                      style={{ width: '80px' }}
                    />
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleUpdateStock(selectedDrug, quantityToAdd);
                        setSelectedDrug(null);
                        setQuantityToAdd(0);
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      variant="secondary"
                      className="ms-2"
                      onClick={() => {
                        setSelectedDrug(null);
                        setQuantityToAdd(0);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-chart-pie me-1"></i>
              Inventory Statistics
            </Card.Header>
            <Card.Body>
              <h5 className="text-center mb-3">Stock Status</h5>
              <div style={{ height: '180px' }}>
                <Doughnut
                  data={{
                    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                    datasets: [{
                      data: [
                        stockStatusData.inStock,
                        stockStatusData.lowStock,
                        stockStatusData.outOfStock
                      ],
                      backgroundColor: ['#198754', '#ffc107', '#dc3545']
                    }]
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
              
              <hr />
              
              <h5 className="text-center mb-3">Categories</h5>
              <div style={{ height: '290px' }}>
                <Bar
                  data={{
                    labels: Object.keys(categories),
                    datasets: [{
                      label: 'Drugs by Category',
                      data: Object.values(categories),
                      backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      borderColor: 'rgb(54, 162, 235)',
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-exclamation-triangle me-1"></i>
              Critical Alerts
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {drugs.filter(d => d.currentStock <= 0).slice(0, 3).map(drug => (
                  <div key={drug._id} className="list-group-item list-group-item-danger d-flex justify-content-between align-items-center">
                    <span>{drug.name}</span>
                    <span>Out of Stock</span>
                  </div>
                ))}
                
                {drugs.filter(d => d.currentStock > 0 && d.currentStock <= d.minStock).slice(0, 3).map(drug => (
                  <div key={drug._id} className="list-group-item list-group-item-warning d-flex justify-content-between align-items-center">
                    <span>{drug.name}</span>
                    <span>Low Stock ({drug.currentStock})</span>
                  </div>
                ))}
                
                {drugs.filter(d => {
                  if (!d.expiryDate) return false;
                  const expiry = new Date(d.expiryDate);
                  const today = new Date();
                  const monthFromNow = new Date();
                  monthFromNow.setMonth(today.getMonth() + 1);
                  return expiry <= monthFromNow && expiry >= today;
                }).slice(0, 3).map(drug => (
                  <div key={drug._id} className="list-group-item list-group-item-info d-flex justify-content-between align-items-center">
                    <span>{drug.name}</span>
                    <span>Expiring Soon</span>
                  </div>
                ))}
              </div>
              
              <div className="card-footer p-3">
                <a href="/pharmacy" className="btn btn-sm btn-outline-primary w-100">
                  View All Alerts
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DrugInventory;
