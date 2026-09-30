import { requireAdminPage } from '@/lib/auth';

export default async function AdminRouteLayout({ children }) {
  await requireAdminPage();
  return children;
}
