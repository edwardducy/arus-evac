import { Flex, Heading, Text, TextField } from "@radix-ui/themes";

function Hazard() {
  return (
    <Flex direction="column" gap="3">
      <Heading size="8">Hazard</Heading>

      <Flex direction="column" gap="1">
        <Text weight="bold">Type</Text>
        <TextField.Root placeholder="e.g. Flood, Fire, Storm surge" />
      </Flex>

      <Flex direction="column" gap="1">
        <Text weight="bold">Severity</Text>
        <TextField.Root placeholder="e.g. Low / Medium / High" />
      </Flex>
    </Flex>
  );
}

export default Hazard;

