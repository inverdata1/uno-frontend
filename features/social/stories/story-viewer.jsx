import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Image, TouchableOpacity, Dimensions, StyleSheet, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../shared/components/ui';

const { width, height } = Dimensions.get('window');

/**
 * Full-screen Instagram-style Story Viewer
 * Based on PDF mockup page 3
 */
export default function StoryViewer({ visible, stories = [], initialIndex = 0, onClose }) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [progressAnims, setProgressAnims] = useState([]);
  const currentStory = stories[currentStoryIndex];

  // Initialize progress animations only once when stories array changes
  useEffect(() => {
    // Stop all running animations first
    progressAnims.forEach(anim => {
      if (anim) anim.stopAnimation();
    });
    // Create new animations for all stories
    const newAnims = stories.map(() => new Animated.Value(0));
    setProgressAnims(newAnims);
  }, [stories.length]);

  // Reset animations when modal opens/closes
  useEffect(() => {
    if (visible && stories.length > 0 && progressAnims.length > 0) {
      // Reset all animations to 0
      progressAnims.forEach(anim => {
        if (anim) {
          anim.stopAnimation();
          anim.setValue(0);
        }
      });
      setCurrentStoryIndex(initialIndex);
      setIsPaused(false);
    } else if (!visible && progressAnims.length > 0) {
      // Stop all animations when closing
      progressAnims.forEach(anim => {
        if (anim) {
          anim.stopAnimation();
          anim.setValue(0);
        }
      });
      setIsPaused(false);
    }
  }, [visible, initialIndex, progressAnims.length]);

  const handleNext = useCallback(() => {
    setCurrentStoryIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex < stories.length) {
        progressAnims[prev]?.setValue(1);
        return nextIndex;
      } else {
        onClose();
        return prev;
      }
    });
  }, [stories.length, onClose, progressAnims]);

  const handlePrevious = useCallback(() => {
    setCurrentStoryIndex(prev => {
      if (prev > 0) {
        progressAnims[prev]?.setValue(0);
        return prev - 1;
      }
      return prev;
    });
  }, [progressAnims]);

  useEffect(() => {
    if (!visible || isPaused || !currentStory || progressAnims.length === 0) {
      return;
    }

    const currentAnim = progressAnims[currentStoryIndex];
    if (!currentAnim) {
      return;
    }

    // Reset current animation to 0 before starting
    currentAnim.setValue(0);

    const duration = (currentStory?.duration || 5) * 1000;

    let timeoutId;
    let isCancelled = false;

    // Small delay to ensure the animation starts properly
    timeoutId = setTimeout(() => {
      if (isCancelled) return;

      // Animate progress bar
      Animated.timing(currentAnim, {
        toValue: 1,
        duration,
        useNativeDriver: false
      }).start(({ finished }) => {
        if (finished && !isCancelled) {
          handleNext();
        }
      });
    }, 50);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      currentAnim.stopAnimation();
    };
  }, [currentStoryIndex, visible, isPaused, currentStory, handleNext, progressAnims]);

  const handlePressIn = () => setIsPaused(true);
  const handlePressOut = () => setIsPaused(false);

  if (!visible || !currentStory) return null;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Story Image/Video */}
        <Image
          source={{ uri: currentStory.mediaUrl }}
          style={styles.media}
          resizeMode="cover"
        />

        {/* Gradient Overlay Top */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topGradient}
        />

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {progressAnims.map((animValue, index) => (
            <View key={index} style={styles.progressBarBg}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.businessInfo}>
            <View style={styles.avatar}>
              <Ionicons name="storefront" size={20} color="#ffffff" />
            </View>
            <Text style={styles.businessName}>Business Name</Text>
            <Text style={styles.timeAgo}>12h</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Tap Zones */}
        <View style={styles.tapZones}>
          <TouchableOpacity
            style={styles.tapLeft}
            onPress={handlePrevious}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.tapRight}
            onPress={handleNext}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Bottom CTA - "Ir a Catalogo" button */}
        {currentStory.taggedProducts?.length > 0 && (
          <View style={styles.ctaContainer}>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaText}>Ir a Catalogo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  media: {
    width,
    height,
    position: 'absolute'
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 2
  },
  progressBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 1
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  businessName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff'
  },
  timeAgo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)'
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tapZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1
  },
  tapLeft: {
    flex: 1
  },
  tapRight: {
    flex: 1
  },
  actions: {
    position: 'absolute',
    right: 16,
    top: '50%',
    gap: 24,
    zIndex: 2
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 2
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  }
});
