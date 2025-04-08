"use client";
import { logoutUser } from "@/actions/user-actions";
import LoginButtons from "./login-buttons";
import Logo from "./logo";
import { Button } from "./ui/button";

interface HeaderProps {
  isLogged?: boolean;
}

export default function Header({ isLogged = false }: HeaderProps) {
  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem("links");
    location.reload();
  };
  return (
    <div className="w-full flex justify-center h-fit">
      <div className="flex w-2xl items-center justify-between p-2 bg-neutral-900 m-2 rounded-2xl">
        <Logo />
        {!isLogged ? (
          <>
            <LoginButtons />
          </>
        ) : (
          <Button variant="destructive" onClick={handleLogout}>
            Sair
          </Button>
        )}
      </div>
    </div>
  );
}
