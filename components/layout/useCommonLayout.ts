import { useRef, useMemo } from 'react';

export type LayoutOptions = {
  showFixBar?: boolean;
  showGoCustomerCenter?: boolean;
};

const defaultOptions: LayoutOptions = {
  showFixBar: false,
  showGoCustomerCenter: false,
};

export const useCommonLayout = (options?: LayoutOptions) => {
  const flatListRef = useRef(null);
  const mergedOptions = useMemo(
    () => ({ ...defaultOptions, ...options }),
    [options],
  );

  return {
    flatListRef,
    ...mergedOptions,
  };
};
