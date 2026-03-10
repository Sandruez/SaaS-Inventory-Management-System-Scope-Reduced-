import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  id: string
  email: string
  organizationId: string
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      organizationId: user.organizationId 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function createUser(email: string, password: string, organizationName: string) {
  const hashedPassword = await hashPassword(password)
  
  const organization = await prisma.organization.create({
    data: {
      name: organizationName,
    },
  })

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      organizationId: organization.id,
    },
    include: {
      organization: true,
    },
  })

  // Create default settings for the organization
  await prisma.settings.create({
    data: {
      organizationId: organization.id,
      defaultLowStockThreshold: 5,
    },
  })

  return user
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organization: true,
    },
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  return user
}
