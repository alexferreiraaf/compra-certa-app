'use client';

import Link from 'next/link';
import { ShoppingCart, History, Home, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';

const Logo = () => (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary-foreground font-headline">
        <div className="p-2 bg-primary-foreground rounded-full">
            <ShoppingCart className="h-6 w-6 text-background" />
        </div>
        <span className="hidden sm:inline-block">Minhas Compras</span>
    </Link>
)

export function Header() {
  const pathname = usePathname();
  const { shoppingList } = useApp();
  const navItems = [
    { href: '/', label: 'Orçamento', icon: Home },
    { href: '/shopping', label: 'Compras', icon: ShoppingCart, badge: shoppingList.length > 0 ? shoppingList.length : undefined },
    { href: '/history', label: 'Histórico', icon: History },
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
             <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-primary-foreground/80",
                  pathname === item.href ? "text-primary-foreground" : "text-primary-foreground/60"
                )}
              >
                {item.label}
                {item.badge && (
                  <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
            {/* Future UserAuth component here */}
            <div className="md:hidden">
                <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <div className="flex flex-col space-y-4 pt-8">
                    <Logo />
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                                pathname === item.href ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                             {item.badge && (
                              <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm">
                                {item.badge}
                              </span>
                            )}
                        </Link>
                    ))}
                    </div>
                </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
