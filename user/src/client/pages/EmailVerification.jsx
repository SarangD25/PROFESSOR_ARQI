import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { verifyEmail } from 'wasp/client/auth';
export default function EmailVerification() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    useEffect(() => {
        if (token) {
            verifyEmail({ token })
                .then(() => {
                alert('Email verified successfully! You can now log in.');
                navigate('/login');
            })
                .catch((err) => {
                alert('Email verification failed: ' + err.message);
                navigate('/login');
            });
        }
    }, [token]);
    return <div>Verifying your email...</div>;
}
