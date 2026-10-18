import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== 'kelachak2024setup') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Make user ADMIN by phone or name
  const result = await prisma.user.updateMany({
    where: {
      OR: [
        { phone: '+998905795559' },
        { phone: '998905795559' },
        { name: 'matyoquboff___' },
      ],
    },
    data: { role: 'ADMIN' },
  });

  const users = await prisma.user.findMany({
    select: { id: true, phone: true, name: true, role: true },
  });

  return NextResponse.json({
    updated: result.count,
    allUsers: users,
  });
}
// cache-bust-16246  
