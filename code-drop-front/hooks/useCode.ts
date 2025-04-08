type SaveCodeResponse = {
  link: string;
};

const useCode = () => {
  const saveCode = async (code: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    });
    if (!res.ok) {
      throw new Error("Code submission failed");
    }
    const resJson: SaveCodeResponse = await res.json();
    const link = resJson.link;

    return link;
  };

  return { saveCode };
};
