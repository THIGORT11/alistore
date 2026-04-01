"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import CartSheet from "./CartSheet";
import LoyaltyWidget from "./LoyaltyWidget";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="w-full bg-background">
      <div className="container flex h-24 max-w-screen-2xl items-center justify-between relative">
        <div className="flex-1 flex justify-start h-full items-center">
          {/* Menu button placeholder */}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center mt-6 pointer-events-auto">
           <Link href="/" className="flex items-center space-x-2 relative z-50">
              <Image src="https://i.imgur.com/ZKz2ztR.png" alt="BabyStore Logo" width={120} height={120} className="h-28 w-28 sm:h-32 sm:w-32 object-contain" priority />
           </Link>
        </div>

        <div className="flex-1 flex items-center justify-end space-x-1 sm:space-x-2">
          <nav className="flex items-center space-x-1 sm:space-x-2 relative z-50">
            <LoyaltyWidget />
            <CartSheet />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.email || ''} />
                      <AvatarFallback>
                        {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
