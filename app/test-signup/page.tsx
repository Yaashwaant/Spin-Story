"use client";

import { useState } from "react";

export default function TestSignupPage() {
  const [status, setStatus] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);

  const testSignup = async () => {
    setStatus("Testing signup...");
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "Test User",
          email: "test@example.com",
          phoneNumber: "+1234567890",
          password: "Test123!",
          confirmPassword: "Test123!",
        }),
        credentials: "include",
      });

      const result = await response.json();
      console.log("Signup result:", result);
      
      if (response.ok) {
        setStatus("✅ Signup successful! Check cookies and redirect.");
      } else {
        setStatus(`❌ Signup failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setStatus(`❌ Network error: ${error}`);
    }
  };

  const getUsers = async () => {
    try {
      const response = await fetch("/api/debug/users");
      const result = await response.json();
      setUsers(result.users || []);
    } catch (error) {
      console.error("Get users error:", error);
      setUsers([]);
    }
  };

  const clearUsers = async () => {
    try {
      await fetch("/api/debug/users", { method: "DELETE" });
      setUsers([]);
      setStatus("Users cleared");
    } catch (error) {
      console.error("Clear users error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Test Signup System</h1>
        
        <div className="space-y-4">
          <button 
            onClick={testSignup} 
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Signup with Sample Data
          </button>
          
          <button 
            onClick={getUsers}
            className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Get All Users
          </button>
          
          <button 
            onClick={clearUsers}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear All Users
          </button>
        </div>
        
        {status && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">Status:</p>
            <p>{status}</p>
          </div>
        )}
        
        {users.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Users ({users.length})</h2>
            {users.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg">
                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phoneNumber}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Onboarded:</strong> {user.onboarded ? "Yes" : "No"}</p>
                <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}