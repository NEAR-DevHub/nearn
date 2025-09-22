import { Bell, Home, Newspaper, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import { useNotificationsInfinite } from '@/features/notifications/queries/useNotifications';

interface Props {
  onSearchOpen: () => void;
}

export function BottomBar({ onSearchOpen }: Props) {
  const { user } = useUser();
  const router = useRouter();

  function setColor(href: string, routerPath: string) {
    return routerPath === href ? 'text-black' : 'text-slate-400';
  }
  const { data } = useNotificationsInfinite({
    read: false,
    limit: 10,
  });
  const unreadCount = data?.pages[0]?.pagination.totalCount || 0;

  const iconStyle = { width: '1.5rem', height: '1.5rem' };

  const linkStyle = {
    WebkitTapHighlightColor: 'transparent',
  } as React.CSSProperties;

  if (router.asPath.startsWith('/new/')) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'flex w-full justify-between border-t border-slate-200 bg-white px-4 py-2',
          'lg:hidden',
        )}
      >
        <Link href="/" style={linkStyle}>
          <Button
            variant="ghost"
            className={cn(
              setColor('/', router.asPath),
              'hover:bg-transparent active:bg-transparent',
            )}
          >
            <Home style={iconStyle} />
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={onSearchOpen}
          style={linkStyle}
          className={cn(
            setColor('/search', router.pathname),
            'hover:bg-transparent active:bg-transparent',
          )}
        >
          <Search style={iconStyle} />
        </Button>

        <Link href="/feed/" style={linkStyle}>
          <Button
            variant="ghost"
            className={cn(
              setColor('/feed/', router.asPath),
              'relative hover:bg-transparent active:bg-transparent',
            )}
          >
            <Newspaper style={iconStyle} />
            <div className="absolute right-3 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          </Button>
        </Link>

        {user && (
          <Link href="/notifications" style={linkStyle}>
            <Button
              variant="ghost"
              className={cn(
                setColor('/notifications/', router.asPath),
                'hover:bg-transparent active:bg-transparent',
              )}
            >
              <Bell style={iconStyle} />
              <Badge
                variant="destructive"
                className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </Button>
          </Link>
        )}

        <AuthWrapper>
          <Link
            href={`/t/${user?.username}`}
            style={{
              ...linkStyle,
              pointerEvents: user ? 'auto' : 'none',
            }}
          >
            <Button
              variant="ghost"
              className={cn(
                setColor(`/t/${user?.username}/`, router.asPath),
                'hover:bg-transparent active:bg-transparent',
              )}
            >
              <User style={iconStyle} />
            </Button>
          </Link>
        </AuthWrapper>
      </div>
    </>
  );
}
