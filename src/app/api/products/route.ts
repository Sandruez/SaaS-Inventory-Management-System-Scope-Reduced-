import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

async function handleGet(req: NextRequest, user: any) {
  try {
    const organizationId = user.organizationId

    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handlePost(req: NextRequest, user: any) {
  try {
    const organizationId = user.organizationId
    const body = await req.json()

    const {
      name,
      sku,
      description,
      quantityOnHand,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    } = body

    // Basic validation
    if (!name || !sku) {
      return NextResponse.json(
        { error: 'Name and SKU are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        organizationId,
        name,
        sku,
        description: description || null,
        quantityOnHand: quantityOnHand || 0,
        costPrice: costPrice || null,
        sellingPrice: sellingPrice || null,
        lowStockThreshold: lowStockThreshold || null,
      },
    })

    return NextResponse.json({
      message: 'Product created successfully',
      product,
    })
  } catch (error: any) {
    console.error('Create product error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGet)
export const POST = withAuth(handlePost)
