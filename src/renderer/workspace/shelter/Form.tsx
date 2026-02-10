import { ArrowLeft } from "lucide-react";

type FormProps = {
  toggleList: () => void;
};

export default function Form({ toggleList }: FormProps) {
  return (
    <div className="">
      <button onClick={toggleList} type="button">
        <ArrowLeft size={48} />
      </button>
      <h2>Add Shelter</h2>
      <p>This is a form to add a new shelter to the scenario</p>
    </div>
  );
}
