import {StyleSheet, View} from 'react-native';
import React from 'react';
import {Box, Heading, HStack} from 'native-base';
import {FontText} from '../FontText';
import {NumberPreprocesser} from '@Utils/NumberPreprocesser';

interface BoxLabelProps {
  label: string;
  Rate: number;
  fontColor: string;
}

export default function BoxLabel({label, Rate, fontColor}: BoxLabelProps) {
  return (
    <Box px={3} py={2} borderBottomColor={'#DDD'} borderBottomWidth={1}>
      <HStack justifyContent="space-between">
        <FontText fontSize="md">{label}</FontText>
        <FontText
          fontSize="md"
          color={fontColor}
          fontWeight={fontColor === '#d71826' ? 'bold' : 'light'}>
          {fontColor === '#d71826' && Rate != 0 ? '-' : ''}
          {NumberPreprocesser(Rate.toString()) + ' 원'}
        </FontText>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({});
