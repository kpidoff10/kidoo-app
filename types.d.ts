declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpeg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.webp' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'pubnub' {
  const PubNub: new (config: { subscribeKey: string; userId?: string; [key: string]: unknown }) => {
    addListener: (listener: unknown) => void;
    removeListener: (listener: unknown) => void;
    subscribe: (params: { channels: string[] }) => void;
    unsubscribe: (params: { channels: string[] }) => void;
  };
  export default PubNub;
}
