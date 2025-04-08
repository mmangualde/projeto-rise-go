"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CircleXIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { User } from "@/actions/user-actions";

const signUpSchema = z
  .object({
    email: z.string().email({ message: "Por favor, insira um email válido" }),
    username: z.string().min(3, {
      message: "O nome de usuário precisa ter pelo menos 3 caracteres",
    }),
    password: z
      .string()
      .min(6, { message: "A senha precisa ter pelo menos 6 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpModalProps {
  onSignUp?: (user: User) => Promise<{ error: string } | undefined>;
}

export default function SignUpModal({ onSignUp }: SignUpModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    if (onSignUp) {
      const result = await onSignUp({
        email: data.email,
        name: data.username,
        password: data.password,
      });
      if (result && result.error) {
        if (result.error.toLowerCase().includes("senha")) {
          setServerError("Senha incorreta. Por favor, verifique sua senha.");
        } else {
          setServerError(
            "Ocorreu um erro no servidor. Tente novamente mais tarde.",
          );
        }
        reset();
      } else {
        setServerError(null);
        closeRef.current?.click();
        reset();
      }
    }
    setIsLoading(false);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>SignUp</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-sm p-6 bg-neutral-900 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-lg font-medium mb-4">
            Criar Conta
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-gray-300">
            Por favor, insira suas informações para criar uma conta.
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
                htmlFor="username"
                className="block text-sm font-medium text-gray-300"
              >
                Nome de Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Seu nome de usuário"
                {...register("username")}
                className="mt-1 block w-full"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.username.message}
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
            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirmar Senha
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  {...register("confirmPassword")}
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
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Carregando..." : "Criar Conta"}
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
