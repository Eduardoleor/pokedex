import type { ComponentRef } from 'react';
import type { View } from 'react-native';

/** Instance a `View` ref points to (exposes `measureInWindow` and friends). */
export type ViewHandle = ComponentRef<typeof View>;
