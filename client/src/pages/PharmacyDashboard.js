import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Badge, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDrugs as getDrugs, addDrug as createDrug, updateDrug, deleteDrug } from '../redux/slices/pharmacySlice';

const PharmacyDashboard = () => {
  const dispatch = useDispatch();
  const { drugs, loading, error } = useSelector((state) => state.pharmacy);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    currentStock: 0,
    minStock: 0,
    price: 0,
    expiryDate: '',
    location: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    dispatch(getDrugs());
  }, [dispatch]);
  
  // Modal handlers
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  const handleShowModal = () => {
    setShowModal(true);
  };
  
  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      currentStock: 0,
      minStock: 0,
      price: 0,
      expiryDate: '',
      location: '',
      description: ''
    });
    setIsEditing(false);
    setSelectedDrug(null);
    setFormError('');
  };
  
  const onChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'currentStock' || name === 'minStock' || name === 'price'
        ? parseFloat(value)
        : value
    });
    setFormError('');
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Drug name is required');
      return false;
    }
    
    if (!formData.category) {
      setFormError('Category is required');
      return false;
    }
    
    if (formData.currentStock < 0) {
      setFormError('Current stock cannot be negative');
      return false;
    }
    
    if (formData.price < 0) {
      setFormError('Price cannot be negative');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isEditing && selectedDrug) {
      dispatch(updateDrug({
        id: selectedDrug._id,
        drugData: formData
      }))
        .unwrap()
        .then(() => {
          handleCloseModal();
        })
        .catch(err => {
          console.error('Error updating drug:', err);
        });
    } else {
      dispatch(createDrug(formData))
        .unwrap()
        .then(() => {
          handleCloseModal();
        })
        .catch(err => {
          console.error('Error creating drug:', err);
        });
    }
  };
  
  const handleEdit = drug => {
    setIsEditing(true);
    setSelectedDrug(drug);
    setFormData({
      name: drug.name,
      genericName: drug.genericName || '',
      category: drug.category || '',
      manufacturer: drug.manufacturer || '',
      currentStock: drug.currentStock,
      minStock: drug.minStock || 0,
      price: drug.price || 0,
      expiryDate: drug.expiryDate ? new Date(drug.expiryDate).toISOString().substring(0, 10) : '',
      location: drug.location || '',
      description: drug.description || ''
    });
    handleShowModal();
  };
  
  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      dispatch(deleteDrug(id))
        .unwrap()
        .catch(err => {
          console.error('Error deleting drug:', err);
        });
    }
  };
  
  // Helper functions for filtering and searching
  const getStockStatus = (current, min) => {
    if (current <= 0) return { status: 'Out of Stock', variant: 'danger' };
    if (current <= min) return { status: 'Low Stock', variant: 'warning' };
    return { status: 'In Stock', variant: 'success' };
  };
  
  const getUniqueCategories = () => {
    const categories = new Set();
    drugs.forEach(drug => {
      if (drug.category) categories.add(drug.category);
    });
    return ['', ...Array.from(categories)];
  };
  
  const filteredDrugs = drugs
    .filter(drug => filterCategory ? drug.category === filterCategory : true)
    .filter(drug => 
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drug.genericName && drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
  // Get statistics
  const getLowStockCount = () => {
    return drugs.filter(drug => drug.currentStock > 0 && drug.currentStock <= drug.minStock).length;
  };
  
  const getOutOfStockCount = () => {
    return drugs.filter(drug => drug.currentStock <= 0).length;
  };
  
  const getExpiringCount = () => {
    const monthFromNow = new Date();
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
    
    return drugs.filter(drug => {
      if (!drug.expiryDate) return false;
      const expiryDate = new Date(drug.expiryDate);
      return expiryDate <= monthFromNow;
    }).length;
  };
  
  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Pharmacy Dashboard</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item active">Pharmacy</li>
      </ol>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col lg={3} md={6}>
          <Card className="bg-primary text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>{drugs.length}</h2>
                  <div>Total Drugs</div>
                </div>
                <div>
                  <i className="fas fa-pills fa-3x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="bg-warning text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>{getLowStockCount()}</h2>
                  <div>Low Stock</div>
                </div>
                <div>
                  <i className="fas fa-exclamation-triangle fa-3x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="bg-danger text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>{getOutOfStockCount()}</h2>
                  <div>Out of Stock</div>
                </div>
                <div>
                  <i className="fas fa-times-circle fa-3x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="bg-info text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>{getExpiringCount()}</h2>
                  <div>Expiring Soon</div>
                </div>
                <div>
                  <i className="fas fa-calendar-alt fa-3x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-pills me-1"></i>
                Drug Inventory
              </div>
              <Button variant="primary" onClick={handleShowModal}>
                <i className="fas fa-plus me-1"></i>
                Add New Drug
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Search drugs..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group>
                    <Form.Select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {getUniqueCategories().map((category, index) => (
                        category !== '' && <option key={index} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('');
                    }}
                    className="w-100"
                  >
                    Clear Filters
                  </Button>
                </Col>
              </Row>
              
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredDrugs.length === 0 ? (
                <div className="text-center">No drugs found</div>
              ) : (
                <div className="table-responsive">
                  <Table bordered hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Generic Name</th>
                        <th>Category</th>
                        <th>Stock</th>
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
                            <td>{drug.name}</td>
                            <td>{drug.genericName}</td>
                            <td>{drug.category}</td>
                            <td>
                              {drug.currentStock}
                              {drug.minStock > 0 && (
                                <small className="text-muted"> (Min: {drug.minStock})</small>
                              )}
                            </td>
                            <td>₹{drug.price?.toFixed(2)}</td>
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
                              <div className="btn-group btn-group-sm">
                                <Button
                                  variant="outline-primary"
                                  onClick={() => handleEdit(drug)}
                                  className="me-1"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  onClick={() => handleDelete(drug._id)}
                                >
                                  <i className="fas fa-trash"></i>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Drug Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Edit Drug' : 'Add New Drug'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Drug Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    placeholder="Enter drug name"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Generic Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={onChange}
                    placeholder="Enter generic name"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={onChange}
                  >
                    <option value="">Select Category</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Analgesic">Analgesic</option>
                    <option value="Anti-inflammatory">Anti-inflammatory</option>
                    <option value="Antiviral">Antiviral</option>
                    <option value="Antipyretic">Antipyretic</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Dermatological">Dermatological</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Manufacturer</Form.Label>
                  <Form.Control
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={onChange}
                    placeholder="Enter manufacturer"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={onChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={onChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={onChange}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={onChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Storage Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={onChange}
                    placeholder="Enter storage location"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Enter drug description"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? 'Update Drug' : 'Add Drug'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PharmacyDashboard;
