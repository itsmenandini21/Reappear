"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Run only on client side
        const token = localStorage.getItem('token');
        
        if (!token) {
            router.push('/');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    // Prevent rendering until authorized
    if (!isAuthorized) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return <>{children}</>;
}
