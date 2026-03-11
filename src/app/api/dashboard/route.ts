import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

async function handleGet(req: NextRequest, user: any) {
  try {
    const organizationId = user.organizationId

    // Get total products count
    const totalProducts = await prisma.product.count({
      where: { organizationId },
    })

    // Get total quantity in stock
    const totalQuantity = await prisma.product.aggregate({
      where: { organizationId },
      _sum: { quantityOnHand: true },
    })

    // Get organization settings for default threshold
    const settings = await prisma.settings.findUnique({
      where: { organizationId },
    })

    const defaultThreshold = settings?.defaultLowStockThreshold || 5

    // Get low stock products
    const allProducts = await prisma.product.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        sku: true,
        quantityOnHand: true,
        lowStockThreshold: true,
      },
    })

    const lowStockProducts = allProducts.filter((product: any) => 
      product.quantityOnHand <= (product.lowStockThreshold || defaultThreshold)
    ).sort((a: any, b: any) => a.quantityOnHand - b.quantityOnHand)

    return NextResponse.json({
      summary: {
        totalProducts,
        totalQuantity: totalQuantity._sum.quantityOnHand || 0,
      },
      lowStockProducts: lowStockProducts.map((product: any) => ({
        ...product,
        threshold: product.lowStockThreshold || defaultThreshold,
      })),
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGet)
