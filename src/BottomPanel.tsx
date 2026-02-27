import { Box, Button, Flex, Text } from "@radix-ui/themes";

function BottomPanel() {
  return (
    <Box className="rounded-xl border border-[var(--gray-a6)] bg-[var(--gray-a2)] px-4 py-3 shadow-sm backdrop-blur-md">
      <Flex align="center" justify="between" gap="3" className="min-w-0">
        <Flex align="center" gap="2" className="shrink-0">
          <Text size="2" weight="bold" className="text-[var(--gray-12)]">
            Timeline
          </Text>
          <Text size="1" className="text-[var(--gray-11)]">
            (empty for now)
          </Text>
        </Flex>

        <Flex align="center" gap="2" className="shrink-0">
          <Button size="1" variant="soft">
            Prev
          </Button>
          <Button size="1" variant="soft">
            Next
          </Button>
        </Flex>
      </Flex>

      <Box className="mt-3 h-10 rounded-lg border border-[var(--gray-a6)] bg-[var(--gray-1)] p-2">
        <Box className="relative h-full w-full overflow-hidden rounded-md bg-[var(--gray-3)]">
          <Box className="absolute inset-y-0 left-0 w-[35%] bg-[var(--accent-9)] opacity-40" />
          <Box className="absolute inset-y-0 left-[35%] w-0.5 bg-[var(--accent-9)]" />
        </Box>
      </Box>
    </Box>
  );
}

export default BottomPanel;
