"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CircleXIcon } from "lucide-react";
import { User } from "@/actions/user-actions";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido" }),
  password: z
    .string()
    .min(6, { message: "A senha precisa ter pelo menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
  onLogin?: (user: User) => Promise<{ error: string } | undefined>;
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    if (onLogin) {
      const result = await onLogin(data);
      if (result && result.error) {
        if (result.error.toLowerCase().includes("email")) {
          setServerError("Email incorreto. Por favor, verifique seu email.");
        } else if (result.error.toLowerCase().includes("password")) {
          setServerError("Senha incorreta. Por favor, verifique sua senha.");
        } else {
          setServerError(
            "Ocorreu um erro no servidor. Tente novamente mais tarde.",
          );
        }
        reset();
      } else {
        setServerError(null);
        reset();
        closeRef.current?.click();
      }
    }
    setIsLoading(false);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Login</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-sm p-6 bg-neutral-900 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-lg font-medium mb-4">
            Entrar
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-gray-300">
            Por favor, insira seu email e senha.
          </Dialog.Description>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <p className="text-xs text-red-600">{serverError}</p>
            )}
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="voce@exemplo.com"
                {...register("email")}
                className="mt-1 block w-full"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Senha
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  {...register("password")}
                  className="block w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-300 cursor-pointer"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Carregando..." : "Login"}
            </Button>
          </form>
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              className="absolute top-3 right-3 rounded-full"
              ref={closeRef}
            >
              <CircleXIcon size={64} />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
