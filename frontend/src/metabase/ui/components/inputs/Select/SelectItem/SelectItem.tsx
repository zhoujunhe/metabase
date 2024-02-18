import { forwardRef } from "react";
import type { Ref, HTMLAttributes } from "react";
import { Group, Text } from "@mantine/core";
import { Icon } from "metabase/ui";
import type { IconName } from "metabase/ui";

interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  label?: string;
  icon?: IconName;
}

export const SelectItem = forwardRef(function SelectItem(
  { value, label = value, icon, ...others }: SelectItemProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <Group ref={ref} spacing="sm" {...others}>
      {icon && <Icon name={icon} />}
      <Text color="inherit" lh="inherit">
        {label}
      </Text>
    </Group>
  );
});
