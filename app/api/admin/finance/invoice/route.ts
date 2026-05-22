// app/api/admin/finance/invoice/route.ts
// Mirrored Billing Route: Invoices created locally here mirror the accounting records managed in the primary Aplos ledger.
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { studentId, title, amount, dueDate } = await req.json();

    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        title,
        amount,
        balanceDue: amount,
        dueDate: new Date(dueDate),
        status: 'UNPAID',
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Billing engine transaction failure' }, { status: 500 });
  }
}