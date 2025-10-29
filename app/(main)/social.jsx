import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUserType } from '../../shared/hooks/use-user-type';
import FeedScreen from '../../modules/social/feed';
import { Text } from '../../shared/components/ui';
import { colors } from '../../shared/utils/colors';

export default function SocialContentScreen() {
  const { currentUserType } = useCurrentUserType();

  // For business mode, show content management (posts, stories)
  if (currentUserType === 'business') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.secondary }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{
            padding: 20,
            paddingTop: 12,
            backgroundColor: colors.bg.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View>
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.text.primary,
                  marginBottom: 4
                }}>
                  Publicaciones
                </Text>
                <Text style={{
                  fontSize: 15,
                  color: colors.text.secondary
                }}>
                  Posts, historias y promociones
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primary[500],
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.primary[500],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Ionicons name="add" size={28} color={colors.text.inverse} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stories Row - Instagram Style */}
          <View style={{
            padding: 20,
            paddingBottom: 16,
            backgroundColor: colors.bg.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light
          }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {/* Add Story Button */}
              <TouchableOpacity style={{ alignItems: 'center' }}>
                <View style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.bg.secondary,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors.border.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 6
                }}>
                  <Ionicons name="add" size={32} color={colors.primary[500]} />
                </View>
                <Text style={{
                  fontSize: 12,
                  color: colors.text.primary,
                  fontWeight: '600'
                }}>
                  Tu historia
                </Text>
              </TouchableOpacity>

              {/* Story Preview (if any exist) */}
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.primary[100],
                  borderWidth: 3,
                  borderColor: colors.primary[500],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 6
                }}>
                  <Ionicons name="time" size={24} color={colors.primary[500]} />
                </View>
                <Text style={{
                  fontSize: 12,
                  color: colors.text.secondary
                }}>
                  24h
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* Quick Create Actions - TikTok Style */}
          <View style={{
            flexDirection: 'row',
            padding: 16,
            gap: 12,
            backgroundColor: colors.bg.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary[500],
                paddingVertical: 14,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: colors.primary[500],
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 3
              }}
            >
              <Ionicons name="camera" size={20} color={colors.text.inverse} />
              <Text style={{
                fontSize: 15,
                fontWeight: '700',
                color: colors.text.inverse
              }}>
                Publicar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.bg.secondary,
                borderWidth: 1.5,
                borderColor: colors.border.light,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="megaphone" size={20} color="#f59e0b" />
            </TouchableOpacity>
          </View>

          {/* Content Grid - Instagram Style */}
          <View style={{
            paddingTop: 8,
            backgroundColor: colors.bg.primary
          }}>
            {/* Tab Icons */}
            <View style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: colors.border.light
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderBottomWidth: 2,
                  borderBottomColor: colors.text.primary
                }}
              >
                <Ionicons name="grid" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center'
                }}
              >
                <Ionicons name="play-circle-outline" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center'
                }}
              >
                <Ionicons name="pricetag-outline" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Photo Grid */}
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap'
            }}>
              {/* Empty State as first "post" */}
              <View style={{
                width: '33.33%',
                aspectRatio: 1,
                padding: 1
              }}>
                <View style={{
                  flex: 1,
                  backgroundColor: colors.bg.secondary,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons name="images-outline" size={32} color={colors.text.secondary} />
                </View>
              </View>

              {/* Mock grid items to show the layout */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <View
                  key={item}
                  style={{
                    width: '33.33%',
                    aspectRatio: 1,
                    padding: 1
                  }}
                >
                  <View style={{
                    flex: 1,
                    backgroundColor: colors.bg.secondary,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="add-outline" size={24} color={colors.border.light} />
                  </View>
                </View>
              ))}
            </View>

            {/* Call to Action */}
            <View style={{
              padding: 32,
              alignItems: 'center',
              backgroundColor: colors.bg.secondary
            }}>
              <Ionicons name="camera-outline" size={48} color={colors.text.secondary} style={{ marginBottom: 12 }} />
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 6,
                textAlign: 'center'
              }}>
                Comparte tus primeros posts
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.text.secondary,
                textAlign: 'center',
                marginBottom: 20
              }}>
                Muestra tus productos y conecta con clientes
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary[500],
                  paddingHorizontal: 32,
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Ionicons name="camera" size={18} color={colors.text.inverse} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.inverse
                }}>
                  Crear publicación
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // For client mode, show social feed (same as before)
  return <FeedScreen />;
}
