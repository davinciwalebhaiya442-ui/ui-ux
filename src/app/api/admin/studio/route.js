import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const requests = await prisma.studioRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return Response.json({ requests });
  } catch (error) {
    console.error('Error fetching admin studio requests:', error);
    return Response.json({ error: 'Failed to fetch studio requests' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, status, internalNotes } = body;

    if (!id) {
      return Response.json({ error: 'Missing request id' }, { status: 400 });
    }

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (internalNotes !== undefined) dataToUpdate.internalNotes = internalNotes;

    const item = await prisma.studioRequest.update({
      where: { id },
      data: dataToUpdate,
    });

    return Response.json({ success: true, request: item });
  } catch (error) {
    console.error('Error updating studio request:', error);
    return Response.json({ error: 'Failed to update studio request' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Missing request id' }, { status: 400 });
    }

    await prisma.studioRequest.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting studio request:', error);
    return Response.json({ error: 'Failed to delete studio request' }, { status: 500 });
  }
}
