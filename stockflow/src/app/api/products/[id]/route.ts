import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

async function handlePut(req: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    const organizationId = user.organizationId
    const productId = params.id
    const body = await req.json()

    // Check if product exists and belongs to user's organization
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

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

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
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
      message: 'Product updated successfully',
      product,
    })
  } catch (error: any) {
    console.error('Update product error:', error)
    
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

async function handleDelete(req: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    const organizationId = user.organizationId
    const productId = params.id

    // Check if product exists and belongs to user's organization
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    return NextResponse.json({
      message: 'Product deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = (req: NextRequest, context: any) => handlePut(req, context.user, context.params)
export const DELETE = (req: NextRequest, context: any) => handleDelete(req, context.user, context.params)
