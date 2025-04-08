"use client";

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CodeBlockComponent from "./code-block-component";
import { SupportedLanguages } from "@/types/languages";
import LinkModal from "./modals/generated-link-modal";
import CopyButton from "./copy-button";
import { saveCode } from "@/actions/code-actions";

interface Option {
  label: string;
  value: SupportedLanguages;
}

const supportedLanguagesOptions: Option[] = [
  { label: "Bash", value: "bash" },
  { label: "C", value: "c" },
  { label: "Clojure", value: "clojure" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Dart", value: "dart" },
  { label: "Elixir", value: "elixir" },
  { label: "Elm", value: "elm" },
  { label: "Erlang", value: "erlang" },
  { label: "F#", value: "fsharp" },
  { label: "GraphQL", value: "graphql" },
  { label: "Go", value: "go" },
  { label: "Groovy", value: "groovy" },
  { label: "Haskell", value: "haskell" },
  { label: "HTML", value: "html" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSX", value: "jsx" },
  { label: "Julia", value: "julia" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Lisp", value: "lisp" },
  { label: "Makefile", value: "makefile" },
  { label: "MATLAB", value: "matlab" },
  { label: "Objective-C", value: "objectivec" },
  { label: "OCaml", value: "ocaml" },
  { label: "PHP", value: "php" },
  { label: "Python", value: "python" },
  { label: "R", value: "r" },
  { label: "Ruby", value: "ruby" },
  { label: "Rust", value: "rust" },
  { label: "Scala", value: "scala" },
  { label: "SQL", value: "sql" },
  { label: "Swift", value: "swift" },
  { label: "TSX", value: "tsx" },
  { label: "TypeScript", value: "typescript" },
];

interface CodeInputProps {
  codeBlockCode: string;
  isView?: boolean;
}

export default function CodeInput({
  codeBlockCode,
  isView = false,
}: CodeInputProps) {
  const [language, setLanguage] = useState<string>("typescript");
  const [isEditMode, setIsEditMode] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [code, setCode] = useState<string>(codeBlockCode);
  const modalRef = useRef<HTMLButtonElement>(null);

  const onGenerateLink = async () => {
    const link = await saveCode(code);
    if (typeof link !== "string") {
      alert("Ocorreu um erro ao salvar o código.");
      return;
    }
    setGeneratedLink(link);
    const links = localStorage.getItem("links");
    localStorage.setItem(
      "links",
      JSON.stringify([...(links ? JSON.parse(links) : []), link]),
    );
    if (modalRef.current) {
      modalRef.current.click();
    }
  };

  return (
    <div className="max-h-full">
      <div className="flex justify-between items-center mb-1">
        <h2 className="">Código</h2>
        <div className="flex items-center gap-2">
          {!isEditMode && <CopyButton label="Copiar código" content={code} />}
          {!isView && (
            <Button onClick={() => setIsEditMode((prev) => !prev)}>
              {isEditMode ? "Visualizar" : "Editar"}
            </Button>
          )}

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="">
              <SelectValue placeholder="Selecione uma linguagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {supportedLanguagesOptions.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CodeBlockComponent
        codeBlockCode={code}
        setCodeBlockCode={setCode}
        language={language}
        isEditMode={isEditMode}
      />
      <LinkModal generatedLink={generatedLink!} refTrigger={modalRef} />

      <div className="flex justify-end">
        {isEditMode && (
          <Button onClick={onGenerateLink} className="mt-2">
            Salvar
          </Button>
        )}
      </div>
    </div>
  );
}
