
'use client';

import Link from 'next/link';
import { LogOut, User, ShoppingCart, History, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const UserNav = () => {
    const { user, isLoading } = useApp();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast({ title: "Você saiu com sucesso." });
            router.push('/');
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro ao sair.", description: error.message });
        }
    };
    
    if (isLoading) {
        return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    if (!user) {
        return (
            <Button variant="ghost" onClick={() => router.push('/')}>
                <User className="mr-2 h-4 w-4" />
                Login
            </Button>
        )
    }

    return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "user"} />
                    <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Utilizador'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)};


export function Header() {
  const pathname = usePathname();
  const { shoppingList } = useApp();
 
  const navItems = [
    { href: '/budget', label: 'Orçamento', icon: ShoppingCart },
    { href: '/shopping', label: 'Compras', icon: ShoppingCart },
    { href: '/history', label: 'Histórico', icon: History },
  ];

  if (pathname === '/') {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/budget" className="flex items-center gap-2 text-xl font-bold text-foreground font-headline">
            <div className="rounded-full bg-primary p-2">
                <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline-block">Compra Certa</span>
        </Link>
      
        <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-2">
                 {navItems.map((item) => (
                    <Button key={item.href} asChild variant={pathname === item.href ? "secondary" : "ghost"}>
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                            {item.href === '/shopping' && shoppingList.length > 0 && (
                                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                                    {shoppingList.length}
                                </span>
                            )}
                        </Link>
                    </Button>
                ))}
            </nav>

            <UserNav />
            <ThemeToggle />
            
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
                        <SheetClose key={item.label} asChild>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                                {item.href === '/shopping' && shoppingList.length > 0 && (
                                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm text-accent-foreground">
                                    {shoppingList.length}
                                </span>
                                )}
                            </Link>
                        </SheetClose>
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
