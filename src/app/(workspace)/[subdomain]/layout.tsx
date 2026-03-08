import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  // Verify user is authenticated
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Verify org exists and user belongs to it
  const org = await prisma.organization.findUnique({
    where: { slug: params.subdomain },
  });

  if (!org) {
    redirect('/login?error=org_not_found');
  }

  // Verify user belongs to this org
  if (!session.user.email) {
    redirect('/login');
  }

  const user = await prisma.user.findFirst({
    where: {
      email: session.user.email,
      orgId: org.id,
    },
  });

  if (!user) {
    redirect('/login?error=unauthorized');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar orgSlug={params.subdomain} userName={user.name} />
      <div className="flex-1 flex flex-col">
        <Header orgName={org.name} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
