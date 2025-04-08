import { useState } from "react";
import { Button } from "./ui/button";

interface CopyButtonProps {
  label: string;
  content: string;
}

export default function CopyButton({ label, content }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar o link:", err);
    }
  };
  return (
    <Button onClick={copyLink} className="">
      {copied ? "Copiado!" : label}
    </Button>
  );
}
