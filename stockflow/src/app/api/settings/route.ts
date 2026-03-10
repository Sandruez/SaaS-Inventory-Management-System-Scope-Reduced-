import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

async function handleGet(req: NextRequest, user: any) {
  try {
    const organizationId = user.organizationId

    const settings = await prisma.settings.findUnique({
      where: { organizationId },
    })

    return NextResponse.json({
      settings: {
        defaultLowStockThreshold: settings?.defaultLowStockThreshold || 5,
      },
    })
  } catch (error: any) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handlePut(req: NextRequest, user: any) {
  try {
    const organizationId = user.organizationId
    const body = await req.json()

    const { defaultLowStockThreshold } = body

    // Basic validation
    if (defaultLowStockThreshold < 0) {
      return NextResponse.json(
        { error: 'Default low stock threshold must be a positive number' },
        { status: 400 }
      )
    }

    const settings = await prisma.settings.upsert({
      where: { organizationId },
      update: {
        defaultLowStockThreshold,
      },
      create: {
        organizationId,
        defaultLowStockThreshold,
      },
    })

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: {
        defaultLowStockThreshold: settings.defaultLowStockThreshold,
      },
    })
  } catch (error: any) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGet)
export const PUT = withAuth(handlePut)
