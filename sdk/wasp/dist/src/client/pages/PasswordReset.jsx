import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { requestPasswordReset, resetPassword } from 'wasp/client/auth';
export default function PasswordReset() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleRequestReset = async (e) => {
        e.preventDefault();
        await requestPasswordReset({ email });
        alert('Password reset email sent!');
    };
    const handleResetPassword = async (e) => {
        e.preventDefault();
        await resetPassword({ token, password });
        alert('Password reset successful! You can now log in.');
        window.location.href = '/login';
    };
    if (token) {
        return (<form onSubmit={handleResetPassword}>
        <h1>Reset Password</h1>
        <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        <button type="submit">Reset Password</button>
      </form>);
    }
    return (<form onSubmit={handleRequestReset}>
      <h1>Forgot Password</h1>
      <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
      <button type="submit">Send Reset Link</button>
    </form>);
}
//# sourceMappingURL=PasswordReset.jsx.map