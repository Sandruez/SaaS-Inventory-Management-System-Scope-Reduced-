import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export function withAuth(handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Add user to context for dynamic routes
    if (context) {
      context.user = user
    }
    
    return handler(req, user, context)
  }
}
