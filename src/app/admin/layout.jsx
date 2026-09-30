import { requireAdminPage } from '@/lib/auth';
import { AdminProvider } from './AdminShell';

export default async function AdminRouteLayout({ children }) {
  await requireAdminPage();
  return <AdminProvider>{children}</AdminProvider>;
}
