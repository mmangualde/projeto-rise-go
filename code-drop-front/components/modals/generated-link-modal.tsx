import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { CircleXIcon } from "lucide-react";
import CopyButton from "../copy-button";

interface LinkModalProps {
  generatedLink: string;
  refTrigger: React.RefObject<HTMLButtonElement | null>;
}

export default function LinkModal({
  generatedLink,
  refTrigger,
}: LinkModalProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="secondary"
          className="hidden"
          onClick={() => setOpen(true)}
          ref={refTrigger}
        >
          Mostrar Link
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-fit p-6 bg-neutral-900 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-lg font-medium mb-4">
            Link gerado com sucesso!
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-gray-300">
            Copie o link abaixo:
          </Dialog.Description>
          <div className="space-y-4">
            <Button
              variant="link"
              className="text-primary underline-offset-4 cursor-pointer"
            >
              {generatedLink}
            </Button>
            <CopyButton label="Copiar Link" content={generatedLink} />
          </div>
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              className="absolute top-3 right-3 rounded-full"
            >
              <CircleXIcon size={64} />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
