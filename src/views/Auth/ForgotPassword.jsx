import React, { useState } from 'react';
import { authService } from '../../services/authService';
import Container from '../../components/ui/Container';
import { Card, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Container className="py-16">
      <Card className="mx-auto max-w-md">
        <CardHeader title="Forgot Password" subtitle="Nhập email để nhận liên kết reset" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          {message && <p className="text-green-700 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      </Card>
    </Container>
  );
}


