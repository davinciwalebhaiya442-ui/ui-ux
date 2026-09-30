import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { uploadAsset, deleteAsset } from '@/lib/storage/r2';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file.arrayBuffer !== 'function') {
    return Response.json({ error: 'A file is required' }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id },
      ],
    },
  });

  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

  const key = `products/${product.slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;

  try {
    await uploadAsset({
      key,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || 'application/octet-stream',
    });

    if (product.downloadFileKey) {
      await deleteAsset(product.downloadFileKey).catch(() => {});
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        downloadFileKey: key,
        downloadFileName: file.name,
        downloadFileSize: file.size,
      },
    });

    return Response.json({
      file: {
        key: updated.downloadFileKey,
        name: updated.downloadFileName,
        size: updated.downloadFileSize,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to upload file' }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id },
      ],
    },
  });

  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

  try {
    if (product.downloadFileKey) {
      await deleteAsset(product.downloadFileKey);
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        downloadFileKey: null,
        downloadFileName: null,
        downloadFileSize: null,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to delete file' }, { status: 503 });
  }
}
