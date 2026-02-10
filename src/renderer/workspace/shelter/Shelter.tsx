import { useState } from "react";
import Form from "./Form";
import List from "./List";

export default function Shelter() {
  const [panel, setPanel] = useState<"list" | "form">("list");
  const toggleList = () => setPanel("list");
  const toggleForm = () => setPanel("form");

  return (
    <div className="h-full p-4">
      {panel === "list" && <List toggleForm={toggleForm} />}
      {panel === "form" && <Form toggleList={toggleList} />}
    </div>
  );
}
