import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Image, TouchableOpacity, Dimensions, StyleSheet, Animated, Modal, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../shared/components/ui';
import { useDeleteStory } from '../hooks/use-stories';
import { useCurrentUserType } from '../../../../shared/hooks/use-user-type';

const { width, height } = Dimensions.get('window');

/**
 * Full-screen Instagram-style Story Viewer
 * Based on PDF mockup page 3
 */
export default function StoryViewer({ visible, stories = [], initialIndex = 0, onClose }) {
  const insets = useSafeAreaInsets();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [progressAnims, setProgressAnims] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const pausedValueRef = useRef(0);
  const currentStory = stories[currentStoryIndex];

  const { currentUserType, currentContext } = useCurrentUserType();
  const deleteStoryMutation = useDeleteStory();

  // Check if current user is the owner of this story
  const isOwner = currentUserType === 'business' &&
    currentContext?.businessId &&
    currentStory?.businessId === currentContext.businessId;

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
    pausedValueRef.current = 0; // Reset pause tracking
    setCurrentStoryIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex < stories.length) {
        progressAnims[prev]?.setValue(1);
        return nextIndex;
      } else {
        // Defer onClose to avoid setState during render
        setTimeout(() => onClose(), 0);
        return prev;
      }
    });
  }, [stories.length, onClose, progressAnims]);

  const handlePrevious = useCallback(() => {
    pausedValueRef.current = 0; // Reset pause tracking
    setCurrentStoryIndex(prev => {
      if (prev > 0) {
        progressAnims[prev]?.setValue(0);
        return prev - 1;
      }
      return prev;
    });
  }, [progressAnims]);

  useEffect(() => {
    if (!visible || !currentStory || progressAnims.length === 0) {
      return;
    }

    const currentAnim = progressAnims[currentStoryIndex];
    if (!currentAnim) {
      return;
    }

    const duration = (currentStory?.duration || 5) * 1000;
    let isCancelled = false;
    let animationHandle;

    if (isPaused) {
      // When paused, stop animation and store current value
      currentAnim.stopAnimation((value) => {
        pausedValueRef.current = value;
      });
      return;
    }

    // Calculate remaining duration based on paused value
    const startValue = pausedValueRef.current;
    const remainingDuration = duration * (1 - startValue);

    // Set to start value (0 if fresh, paused value if resuming)
    currentAnim.setValue(startValue);

    // Small delay to ensure the animation starts properly
    const timeoutId = setTimeout(() => {
      if (isCancelled) return;

      // Animate progress bar from current value to 1
      animationHandle = Animated.timing(currentAnim, {
        toValue: 1,
        duration: remainingDuration,
        useNativeDriver: false
      }).start(({ finished }) => {
        if (finished && !isCancelled) {
          pausedValueRef.current = 0; // Reset for next story
          handleNext();
        }
      });
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      if (animationHandle) {
        currentAnim.stopAnimation((value) => {
          pausedValueRef.current = value;
        });
      }
    };
  }, [currentStoryIndex, visible, isPaused, currentStory, handleNext, progressAnims]);

  const pressStartTime = useRef(0);
  const LONG_PRESS_THRESHOLD = 200; // milliseconds

  const handlePressIn = () => {
    pressStartTime.current = Date.now();
    setIsPaused(true);
  };

  const handlePressOut = () => {
    setIsPaused(false);
  };

  const handleTapLeft = () => {
    const pressDuration = Date.now() - pressStartTime.current;
    // Only navigate if it was a quick tap (not a long press)
    if (pressDuration < LONG_PRESS_THRESHOLD) {
      handlePrevious();
    }
  };

  const handleTapRight = () => {
    const pressDuration = Date.now() - pressStartTime.current;
    // Only navigate if it was a quick tap (not a long press)
    if (pressDuration < LONG_PRESS_THRESHOLD) {
      handleNext();
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    setIsPaused(true);
    Alert.alert(
      'Eliminar historia',
      '¿Estás seguro de que quieres eliminar esta historia?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setIsPaused(false)
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteStoryMutation.mutate(currentStory.id, {
              onSuccess: () => {
                // Remove deleted story from array
                const updatedStories = stories.filter(s => s.id !== currentStory.id);
                if (updatedStories.length === 0) {
                  // No more stories, close viewer
                  onClose();
                } else if (currentStoryIndex >= updatedStories.length) {
                  // Was last story, go to previous
                  handlePrevious();
                } else {
                  // Go to next story
                  handleNext();
                }
              },
              onError: () => {
                setIsPaused(false);
              }
            });
          }
        }
      ]
    );
  };

  if (!visible || !currentStory) return null;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Story Image/Video */}
        {currentStory.mediaUrl ? (
          <Image
            source={{ uri: currentStory.mediaUrl }}
            style={styles.media}
            resizeMode="cover"
            onError={(error) => console.error('Failed to load story media:', error)}
          />
        ) : (
          <View style={[styles.media, { backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="image-outline" size={64} color="#666" />
            <Text style={{ color: '#666', marginTop: 12 }}>Media not available</Text>
          </View>
        )}

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
              {currentStory.logoUrl ? (
                <Image
                  source={{ uri: currentStory.logoUrl }}
                  style={{ width: '100%', height: '100%', borderRadius: 18 }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="storefront" size={20} color="#ffffff" />
              )}
            </View>
            <Text style={styles.businessName}>{currentStory.businessName || 'Business'}</Text>
            <Text style={styles.timeAgo}>12h</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {isOwner && (
              <TouchableOpacity
                onPress={() => {
                  setIsPaused(true);
                  setMenuVisible(true);
                }}
                style={styles.menuButton}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Caption - Centered in middle if present */}
        {currentStory.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{currentStory.caption}</Text>
          </View>
        )}

        {/* Tap Zones */}
        <View style={styles.tapZones}>
          <TouchableOpacity
            style={styles.tapLeft}
            onPress={handleTapLeft}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.tapRight}
            onPress={handleTapRight}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          />
        </View>

        {/* Bottom Message Input - Instagram style */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
          {/* "Ir a Catalogo" button above input if products tagged */}
          {currentStory.taggedProducts?.length > 0 && (
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaText}>Ir a Catalogo</Text>
            </TouchableOpacity>
          )}

          <View style={styles.messageInputContainer}>
            <View style={styles.messageInput}>
              <Text style={styles.messageInputPlaceholder}>Enviar mensaje</Text>
            </View>
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="paper-plane-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart-outline" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Custom Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setMenuVisible(false);
          setIsPaused(false);
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end'
          }}
          onPress={() => {
            setMenuVisible(false);
            setIsPaused(false);
          }}
        >
          <View style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 34
          }}>
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 20,
                gap: 12
              }}
            >
              <Ionicons name="trash" size={22} color="#DC2626" />
              <Text style={{ fontSize: 16, color: '#DC2626' }}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
  menuButton: {
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
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 3
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  messageInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  messageInputPlaceholder: {
    color: '#ffffff',
    fontSize: 15
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  likeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a'
  },
  captionContainer: {
    position: 'absolute',
    bottom: 150,
    left: 16,
    right: 16,
    zIndex: 2,
    alignItems: 'center'
  },
  captionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    paddingHorizontal: 24
  }
});
