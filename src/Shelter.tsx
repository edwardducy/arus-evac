import { ArrowLeftIcon, PlusIcon } from "@radix-ui/react-icons";
import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";

function Form({ setPanel }: { setPanel: (p: "list" | "form") => void }) {
  return (
    <>
      <Flex align="center" gap="2">
        <Button variant="soft" size="1" onClick={() => setPanel("list")}>
          <ArrowLeftIcon />
          Back
        </Button>
      </Flex>
      <Heading size="8">Add Shelter</Heading>
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="1">
          <Text weight={"bold"}>Name</Text>
          <TextField.Root placeholder="Shelter Name"></TextField.Root>
        </Flex>
        <Flex direction="column" gap="1">
          <Text weight={"bold"}>Capacity</Text>
          <TextField.Root placeholder="Capacity"></TextField.Root>
        </Flex>
        <Flex direction="column" gap="1">
          <Text weight={"bold"}>Location</Text>
          <TextField.Root placeholder="Location"></TextField.Root>
        </Flex>
      </Flex>
      <Button>Add Shelter</Button>
    </>
  );
}

function List({ setPanel }: { setPanel: (p: "list" | "form") => void }) {
  return (
    <>
      <Heading size="8">Shelter</Heading>
      <Flex direction="column" gap="2">
        <Button onClick={() => setPanel("form")}>
          <PlusIcon />
          Add Shelter
        </Button>

        <TextField.Root placeholder="Search for shelter" />
      </Flex>
    </>
  );
}

function Shelter() {
  const [panel, setPanel] = useState<"list" | "form">("list");

  return (
    <>
      {panel === "list" && <List setPanel={setPanel} />}
      {panel === "form" && <Form setPanel={setPanel} />}
    </>
  );
}

export default Shelter;
