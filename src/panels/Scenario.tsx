import { Flex, Heading, Text, TextField } from "@radix-ui/themes";

function Scenario() {
  return (
    <Flex direction="column" gap="3">
      <Heading size="8">Scenario</Heading>

      <Flex direction="column" gap="1">
        <Text weight="bold">Name</Text>
        <TextField.Root placeholder="e.g. Typhoon - Landfall" />
      </Flex>

      <Flex direction="column" gap="1">
        <Text weight="bold">Description</Text>
        <TextField.Root placeholder="Optional notes" />
      </Flex>
    </Flex>
  );
}

export default Scenario;

