import {Minus, Plus} from '@tamagui/lucide-icons';
import {Button, Input, XStack} from 'tamagui';

export default function QuantityInput(props: {
  value: number;
  onChange: (quantity: number) => void;
  maxValue: number;
  minValue: number;
  disabled: boolean;
}) {
  const handleDecrease = () => {
    if (props.value > props.minValue) {
      props.onChange(props.value - 1);
    }
  };

  const handleIncrease = () => {
    if (props.value < props.maxValue) {
      props.onChange(props.value + 1);
    }
  };

  return (
    <XStack flex={1} width={'100%'} alignItems="center" gap={4}>
      <Button
        aspectRatio={1}
        themeInverse
        theme="accent"
        disabled={props.disabled || props.value <= props.minValue}
        onPress={handleDecrease}
        icon={<Minus size={12} />}
      />

      <Input
        textAlign="center"
        minWidth={50}
        value={props.value.toString()}
        fontSize={'$3'}
        readOnly
      />

      <Button
        theme="accent"
        themeInverse
        aspectRatio={1}
        disabled={props.disabled || props.value >= props.maxValue}
        onPress={handleIncrease}
        icon={<Plus size={12} />}
      />
    </XStack>
  );
}
