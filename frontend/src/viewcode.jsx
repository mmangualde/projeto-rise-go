import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./componentes/header";

const ViewCode = () => {
  const { id } = useParams();
  const [code, setCode] = useState("");

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/view/${id}`);
        const data = await response.json();

        if (response.ok) {
          setCode(data.code);
        } else {
          setCode("Erro ao carregar o texto.");
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setCode("Erro de conexão com o servidor.");
      }
    };

    fetchCode();
  }, [id]);

  return (
    <>
      <Header />
      <div className="container">
        {code ? (
          <>
            <h1 className="text-black font-mono">Código:</h1>
            <textarea name="returnedCode" id="returnedCode" cols="70" rows="15" value={code} readOnly
            className="border-solid border-gray-200 text-2xl resize-none"></textarea>
          </>
        ) : (
          <p>Carregando...</p>          
        )}
            <form action="http://localhost:5173">
              <input type="submit" value="Voltar" className="bg-blue-800 text-white border-2 border-white px-6 py-2 rounded-md cursor-pointer" />
            </form>
      </div>
    </>
  );
};

export default ViewCode;