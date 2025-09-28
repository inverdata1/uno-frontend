import React, { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet';
import { cn } from '../../utils/cn';

const CustomBackdrop = (props) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.5}
  />
);

const CustomHandle = () => (
  <View className="items-center py-3">
    <View className="w-10 h-1 bg-gray-300 rounded-full" />
  </View>
);

export const BottomSheetComponent = forwardRef(({
  children,
  snapPoints = ['50%', '90%'],
  enablePanDownToClose = true,
  enableDynamicSizing = false,
  scrollable = false,
  className,
  backgroundStyle,
  handleStyle,
  onClose,
  ...props
}, ref) => {
  const points = useMemo(() => snapPoints, [snapPoints]);

  const Content = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheet
      ref={ref}
      snapPoints={points}
      enablePanDownToClose={enablePanDownToClose}
      enableDynamicSizing={enableDynamicSizing}
      backdropComponent={CustomBackdrop}
      handleComponent={CustomHandle}
      backgroundStyle={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        ...backgroundStyle
      }}
      handleStyle={{
        backgroundColor: 'transparent',
        ...handleStyle
      }}
      onClose={onClose}
      {...props}
    >
      <Content
        className={cn('flex-1', className)}
        contentContainerStyle={scrollable ? { paddingBottom: 20 } : undefined}
      >
        {children}
      </Content>
    </BottomSheet>
  );
});

BottomSheetComponent.displayName = 'BottomSheet';