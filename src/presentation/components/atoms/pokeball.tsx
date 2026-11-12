import { Animated, StyleSheet, View } from 'react-native';

import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { pokeball } from '@/presentation/theme';

export interface PokeballProps {
  size: number;
  /** 0 closed, 1 open: lifts the top half around its hinge. */
  open?: Animated.Value;
}

const STROKE = 3.5;
const VIEW_BOX = '0 0 100 100';

/** Poké Ball drawn in two layers so the lid can swing open. */
export function Pokeball({ size, open }: PokeballProps) {
  const lidRotation = open
    ? open.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-38deg'] })
    : '0deg';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={VIEW_BOX} style={StyleSheet.absoluteFill}>
        <Path
          d="M3 50 A47 47 0 0 0 97 50 Z"
          fill={pokeball.white}
          stroke={pokeball.black}
          strokeWidth={STROKE}
        />
        <Rect x={3} y={50} width={94} height={4} fill={pokeball.black} />
      </Svg>

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transformOrigin: '6% 50%', transform: [{ rotate: lidRotation }] },
        ]}
      >
        <Svg width={size} height={size} viewBox={VIEW_BOX}>
          <Path
            d="M3 50 A47 47 0 0 1 97 50 Z"
            fill={pokeball.red}
            stroke={pokeball.black}
            strokeWidth={STROKE}
          />
          <Rect x={3} y={46} width={94} height={4} fill={pokeball.black} />
          <Ellipse cx={30} cy={26} rx={10} ry={6} fill={pokeball.white} opacity={0.35} />
        </Svg>
      </Animated.View>

      <Svg width={size} height={size} viewBox={VIEW_BOX} style={StyleSheet.absoluteFill}>
        <Circle cx={50} cy={50} r={13} fill={pokeball.black} />
        <Circle cx={50} cy={50} r={9} fill={pokeball.white} />
        <Circle cx={50} cy={50} r={5} fill="none" stroke={pokeball.black} strokeWidth={1.5} />
      </Svg>
    </View>
  );
}
