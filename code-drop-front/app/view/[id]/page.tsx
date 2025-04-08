import Body from "@/components/body";
import React from "react";
interface ViewCodePageProps {
  params: {
    id: string;
  };
}

export default function ViewCodePage({ params }: ViewCodePageProps) {
  return (
    <div className="max-h-screen min-h-screen w-screen overflow-hidden">
      <Body view params={params} />
    </div>
  );
}
