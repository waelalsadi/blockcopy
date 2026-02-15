import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Return NextResponse.next() to allow the request
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Allow access if user is logged in
        if (token) return true;
        
        // Allow access to login and register pages
        if (req.nextUrl.pathname.startsWith('/login') || 
            req.nextUrl.pathname.startsWith('/register')) {
          return true;
        }
        
        return false;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/', '/project/:path*', '/login', '/register'],
};
