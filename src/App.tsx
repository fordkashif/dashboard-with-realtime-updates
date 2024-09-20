import { useEffect, useState } from 'react';
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    suite: string;
    zipcode: string;
  };
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5); // Customizable page size
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // For real-time updates
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // For tracking the interval ID

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) {
          throw new Error('Network error');
        }
        const data: User[] = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError('Failed to load users from API');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle sorting with icons
  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a[key as keyof User] < b[key as keyof User]) return direction === 'asc' ? -1 : 1;
      if (a[key as keyof User] > b[key as keyof User]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredUsers(sortedUsers);
  };

  // Get sorting icon
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return ''; // No icon if not sorted by this column
  };

  // Handle user deletion with confirmation
  const handleDeleteUser = (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    }
  };

  // Open the modal to Add a new user
  const handleAddUser = () => {
    setEditUser(null); // Clear form for adding a new user
    setShowModal(true);
  };

  // Open the modal to Edit an existing user
  const handleEditUser = (user: User) => {
    setEditUser(user); // Pre-fill the form with the user data for editing
    setShowModal(true);
  };

  // Handle form submission for both adding and editing users
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: editUser ? editUser.id : Date.now(), // Use a timestamp for new users
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      address: {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        suite: '',
        zipcode: formData.get('zipcode') as string,
      },
    };

    if (editUser) {
      // Update existing user
      setUsers(users.map((user) => (user.id === editUser.id ? newUser : user)));
      setFilteredUsers(filteredUsers.map((user) => (user.id === editUser.id ? newUser : user)));
    } else {
      // Add new user
      setUsers([...users, newUser]);
      setFilteredUsers([...filteredUsers, newUser]);
    }

    setShowModal(false); // Close modal after submission
  };

  // Fetch a random user from randomuser.me API
  const fetchRandomUser = async () => {
    try {
      const response = await fetch('https://randomuser.me/api/');
      const data = await response.json();
      const randomUser = {
        id: Date.now(),
        name: `${data.results[0].name.first} ${data.results[0].name.last}`,
        email: data.results[0].email,
        address: {
          street: data.results[0].location.street.name,
          city: data.results[0].location.city,
          suite: '',
          zipcode: data.results[0].location.postcode,
        },
      };
      // Add the new random user to the list
      setUsers((prevUsers) => [...prevUsers, randomUser]);
      setFilteredUsers((prevUsers) => [...prevUsers, randomUser]);
    } catch (error) {
      console.error('Error fetching random user:', error);
    }
  };

  // Start real-time updates
  const handleStartUpdates = () => {
    if (!isUpdating) {
      const newIntervalId = setInterval(() => {
        fetchRandomUser();
      }, 10000); // Fetch every 10 seconds
      setIntervalId(newIntervalId); // Save interval ID
      setIsUpdating(true); // Mark updates as started
    }
  };

  // Stop real-time updates
  const handleStopUpdates = () => {
    if (intervalId) {
      clearInterval(intervalId); // Clear the interval
      setIsUpdating(false); // Mark updates as stopped
      setIntervalId(null); // Clear the interval ID
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="App">
      <h1>User Dashboard</h1>

      {/* Search input and Add User Button */}
      <div className="search-add-container">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ marginBottom: '20px' }}
        />
        <button onClick={handleAddUser} style={{ marginBottom: '20px' }}>
          Add User
        </button>
      </div>

      {/* Start and Stop real-time updates buttons */}
      <button onClick={isUpdating ? handleStopUpdates : handleStartUpdates} style={{ marginBottom: '20px' }}>
        {isUpdating ? 'Stop Real-Time Updates' : 'Start Real-Time Updates'}
      </button>

      {/* Page size dropdown */}
      <label>
        Page size:
        <select value={usersPerPage} onChange={handlePageSizeChange}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </label>

      {/* User Table */}
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Name {getSortIcon('name')}
            </th>
            <th onClick={() => handleSort('email')}>
              Email {getSortIcon('email')}
            </th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {user.address.street}, {user.address.city}, {user.address.zipcode}
                </td>
                <td>
                  <button onClick={() => handleEditUser(user)}>Edit</button>
                  <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={index + 1 === currentPage ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input name="name" type='text' defaultValue={editUser?.name || ''} required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input name="email" type="email" defaultValue={editUser?.email || ''} required />
              </div>
              <div className="form-group">
                <label>Street:</label>
                <input type='text' name="street" defaultValue={editUser?.address.street || ''} required />
              </div>
              <div className="form-group">
                <label>City:</label>
                <input type='text' name="city" defaultValue={editUser?.address.city || ''} required />
              </div>
              <div className="form-group">
                <label>Zipcode:</label>
                <input type='text' name="zipcode" defaultValue={editUser?.address.zipcode || ''} required />
              </div>
              <div className="form-actions">
                <button type="submit">{editUser ? 'Update User' : 'Add User'}</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
