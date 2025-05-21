import React, { useState } from 'react';

const Signup = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    walletAddress: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Signup submitted:\nEmail: ${form.email}\nWallet: ${form.walletAddress}`);
    // Add your signup logic here
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl mb-6 font-semibold">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="walletAddress"
          type="text"
          placeholder="Crypto Wallet Address (e.g. 0xABC123...)"
          value={form.walletAddress}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
