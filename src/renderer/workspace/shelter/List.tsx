import { Button } from "@/components/Button";
import EmptyListPlaceholder from "./EmptyListPlaceholder";

type ListProps = {
  toggleForm: () => void;
};

export default function List({ toggleForm }: ListProps) {
  return (
    <div className="">
      <h2>Shelter Overview</h2>
      <p>This is a list of shelters found in the scenario</p>
      <Button onClick={toggleForm}>Add New Shelter</Button>
      <EmptyListPlaceholder />
    </div>
  );
}
