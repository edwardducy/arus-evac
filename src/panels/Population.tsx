import { Flex, Heading, Text, TextField } from "@radix-ui/themes";

function Population() {
  return (
    <Flex direction="column" gap="3">
      <Heading size="8">Population</Heading>

      <Flex direction="column" gap="1">
        <Text weight="bold">Source</Text>
        <TextField.Root placeholder="e.g. Census, Admin records" />
      </Flex>

      <Flex direction="column" gap="1">
        <Text weight="bold">Notes</Text>
        <TextField.Root placeholder="Optional notes" />
      </Flex>
    </Flex>
  );
}

export default Population;

