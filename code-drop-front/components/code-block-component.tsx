"use client";
import React, { useEffect } from "react";
import AceEditor from "react-ace";
import ace from "ace-builds";

import "ace-builds/src-noconflict/theme-one_dark";
import { CodeBlock } from "react-code-block";
ace.config.set("basePath", "/path/to/ace");

const CodeBlockComponent = ({
  codeBlockCode,
  setCodeBlockCode,
  language = "typescript",
  isEditMode = false,
}: {
  codeBlockCode: string;
  setCodeBlockCode: (newCode: string) => void;
  language: string;
  isEditMode: boolean;
}) => {
  useEffect(() => {
    import(
      `ace-builds/src-noconflict/mode-${language.toLowerCase() == "go" ? "golang" : language}`
    );
  }, [language]);

  const handleCodeChange = (newCode: string) => {
    setCodeBlockCode(newCode);
  };

  return (
    <div>
      {isEditMode ? (
        <AceEditor
          placeholder="Placeholder Text"
          mode={language.toLowerCase() == "go" ? "golang" : language}
          theme="one_dark"
          className="rounded-xl"
          fontSize={14}
          lineHeight={19}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          width="100%"
          height="48rem"
          value={codeBlockCode}
          onChange={handleCodeChange}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            enableMobileMenu: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      ) : (
        <div className="h-[45rem]">
          <CodeBlock code={codeBlockCode} language={language}>
            <CodeBlock.Code className="bg-neutral-900 p-6 rounded-xl h-[51.1rem] overflow-auto text-[14px]">
              <CodeBlock.LineContent>
                <CodeBlock.Token />
              </CodeBlock.LineContent>
            </CodeBlock.Code>
          </CodeBlock>
        </div>
      )}
    </div>
  );
};

export default CodeBlockComponent;
