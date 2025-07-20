import {Canvas, DiffRect, rect, rrect} from '@shopify/react-native-skia';
import {StyleSheet} from 'react-native';

export default function ScannerOverlay(props: {
  parentWidth: number;
  parentHeight: number;
}) {
  const innerDimension = Math.min(props.parentWidth, props.parentHeight) * 0.6; // 60% of the smaller dimension

  const outer = rrect(rect(0, 0, props.parentWidth, props.parentHeight), 0, 0);
  const inner = rrect(
    rect(
      props.parentWidth / 2 - innerDimension / 2,
      props.parentHeight / 2 - innerDimension / 2,
      innerDimension,
      innerDimension,
    ),
    50,
    50,
  );
  return (
    <Canvas style={StyleSheet.absoluteFillObject}>
      <DiffRect inner={inner} outer={outer} color="black" opacity={0.3} />
    </Canvas>
  );
}
