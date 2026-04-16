import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error('useAuth must be used within AuthProvider');
}
return context;
};

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const token = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');

```
if (token && savedUser) {
  setUser(JSON.parse(savedUser));
}
setLoading(false);
```

}, []);

const login = async (email, password) => {
try {
const response = await authAPI.login({ email, password });

```
  console.log("LOGIN RESPONSE:", response.data);

  const token =
    response.data.token ||
    response.data.data?.token ||
    response.data.accessToken;

  const user =
    response.data.user ||
    response.data.data?.user ||
    response.data.data;

  if (!token || !user) {
    throw new Error("Invalid response from server");
  }

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  setUser(user);

  return { success: true, user };

} catch (error) {
  console.error("LOGIN ERROR:", error);

  return {
    success: false,
    message:
      error.response?.data?.message ||
      error.message ||
      'Login failed',
  };
}
```

};

const logout = () => {
localStorage.removeItem('token');
localStorage.removeItem('user');
setUser(null);
};

const value = {
user,
login,
logout,
loading,
isAuthenticated: !!user,
isAdmin: user?.role === 'admin',
isEmployee: user?.role === 'employee',
};

return (
<AuthContext.Provider value={value}>
{children}
</AuthContext.Provider>
);
};

