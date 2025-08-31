
'use client';

import Link from 'next/link';
import { LogOut, User, ShoppingCart, History, Home, Menu, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

const UserNav = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="#" alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Utilizador</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        user@example.com
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);


export function Header() {
  const pathname = usePathname();
  const { shoppingList } = useApp();
  const navItems = [
    { href: '/budget', label: 'Orçamento', icon: DollarSign },
    { href: '/shopping', label: 'Compras', icon: ShoppingCart },
    { href: '/list', label: 'Lista', icon: ShoppingCart, badge: shoppingList.length > 0 ? shoppingList.length : undefined },
    { href: '/history', label: 'Histórico', icon: History },
  ];

  if (pathname === '/') {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
             <Link href="/budget" className="flex items-center gap-2 text-xl font-bold text-foreground font-headline">
                <div className="p-2 bg-primary rounded-full">
                    <ShoppingCart className="h-6 w-6 text-primary-foreground" />
                </div>
            </Link>
            <div className="hidden md:flex items-center gap-2">
                <UserNav />
                 <div className="flex flex-col">
                    <span className="text-sm font-semibold">Utilizador</span>
                 </div>
            </div>
        </div>
      
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
                <Button variant="destructive" size="sm">
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                </Button>
            </Link>
            <div className="md:hidden">
                <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle navigation</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <div className="flex flex-col space-y-4 pt-8">
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

    