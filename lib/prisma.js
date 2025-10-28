// import { PrismaClient } from "@prisma/client";
// let prisma;
// if (process.env.NODE_ENV === "production") prisma = new PrismaClient();
// else {
//   if (!global.prisma) global.prisma = new PrismaClient();
//   prisma = global.prisma;
// }
// export default prisma;

// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
