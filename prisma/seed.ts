import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '..', '.env') })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/400/300`
}

async function main() {
  const existing = await prisma.menuItem.count()
  if (existing > 0) {
    console.log('Menu items already exist, skipping seed.')
    return
  }

  const items = [
    { code: 'P1', name: 'Pollo 1/4', description: 'Pierna o muslo con arroz, ensalada y tortillas', price: 65, category: 'pollos', image: img('pollo1') },
    { code: 'P2', name: 'Pollo 1/2', description: 'Pechuga con arroz, ensalada y tortillas', price: 90, category: 'pollos', image: img('pollo2') },
    { code: 'P3', name: 'Pollo Entero', description: 'Pollo completo con arroz, ensalada y tortillas', price: 150, category: 'pollos', image: img('pollo3') },
    { code: 'H1', name: 'Hamburguesa Sencilla', description: 'Carne 200g, lechuga, tomate y cebolla', price: 55, category: 'hamburguesas', image: img('hamb1') },
    { code: 'H2', name: 'Hamburguesa con Queso', description: 'Carne 200g, queso amarillo, lechuga y tomate', price: 65, category: 'hamburguesas', image: img('hamb2') },
    { code: 'H3', name: 'Hamburguesa Especial', description: 'Doble carne, doble queso, tocino y papas', price: 85, category: 'hamburguesas', image: img('hamb3') },
    { code: 'T1', name: 'Tacos de Pollo (3)', description: 'Tres tacos de pollo con cebolla y cilantro', price: 40, category: 'tacos', image: img('tacos1') },
    { code: 'T2', name: 'Tacos de Carne (3)', description: 'Tres tacos de carne asada con cebolla y cilantro', price: 50, category: 'tacos', image: img('tacos2') },
    { code: 'G1', name: 'Guacamole con Totopos', description: 'Guacamole fresco con totopos crujientes', price: 45, category: 'guarniciones', image: img('guac1') },
    { code: 'G2', name: 'Papas a la Francesa', description: 'Papas crujientes con sal', price: 35, category: 'guarniciones', image: img('papas1') },
    { code: 'B1', name: 'Agua Fresca 1L', description: 'Horchata, Jamaica o limón', price: 25, category: 'bebidas', image: img('agua1') },
    { code: 'B2', name: 'Refresco 600ml', description: 'Coca-Cola, Sprite o Sidral', price: 20, category: 'bebidas', image: img('refresco1') },
    { code: 'B3', name: 'Agua Natural 1L', description: 'Agua purificada', price: 15, category: 'bebidas', image: img('agua2') },
  ]

  for (const item of items) {
    await prisma.menuItem.create({ data: item })
  }

  console.log(`Seeded ${items.length} menu items with images.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
