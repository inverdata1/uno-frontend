import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Card, Text, Input } from '../../shared/components/ui';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-4 space-y-4">

        {/* Header */}
        <Card>
          <Text variant="heading" className="mb-2">
            Theme System Test
          </Text>
          <Text variant="caption">
            Testing our scalable theme system 🎨
          </Text>
        </Card>

        {/* Buttons */}
        <Card>
          <Text variant="subheading" className="mb-4">
            Buttons
          </Text>
          <View className="space-y-3">
            <Button variant="primary" size="lg">
              Primary Button
            </Button>
            <Button variant="secondary" size="md">
              Secondary Button
            </Button>
            <Button variant="success" size="sm">
              Success Button
            </Button>
            <Button variant="destructive">
              Destructive Button
            </Button>
            <Button variant="ghost">
              Ghost Button
            </Button>
          </View>
        </Card>

        {/* Typography */}
        <Card>
          <Text variant="subheading" className="mb-4">
            Typography
          </Text>
          <View className="space-y-2">
            <Text variant="heading">This is a heading</Text>
            <Text variant="subheading">This is a subheading</Text>
            <Text variant="body">This is body text with normal weight</Text>
            <Text variant="caption">This is caption text</Text>
            <Text variant="label">This is label text</Text>
          </View>
        </Card>

        {/* Form */}
        <Card>
          <Text variant="subheading" className="mb-4">
            Form Elements
          </Text>
          <View className="space-y-3">
            <Input placeholder="Enter your email" />
            <Input placeholder="Enter your password" secureTextEntry />
            <Button variant="primary" className="mt-2">
              Submit
            </Button>
          </View>
        </Card>

        {/* Colors */}
        <Card>
          <Text variant="subheading" className="mb-4">
            Color System
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="w-12 h-12 bg-primary-500 rounded" />
            <View className="w-12 h-12 bg-success rounded" />
            <View className="w-12 h-12 bg-warning rounded" />
            <View className="w-12 h-12 bg-destructive rounded" />
            <View className="w-12 h-12 bg-muted rounded" />
          </View>
        </Card>

      </View>
    </ScrollView>
  );
}

