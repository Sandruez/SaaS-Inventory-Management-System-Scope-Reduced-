import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { email, password, organizationName } = body
    
    // Basic validation
    if (!email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'Email, password, and organization name are required' },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }
    
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    const user = await createUser(email, password, organizationName)
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
      },
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
