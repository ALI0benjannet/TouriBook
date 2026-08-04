import { useEffect, useState } from "react";
import { api } from "./api";

function App() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    api.get("/").then((res) => setMsg(res.data.message));
  }, []);
  return <h1>{msg || "Chargement..."}</h1>;
}
export default App;