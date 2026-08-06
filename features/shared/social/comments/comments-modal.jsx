import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../../shared/components/ui/text';
import { useAuthStore } from '../../../../core/auth/stores/auth-store';
import { colors } from '../../../../shared/utils/colors';
import { useComments, useCreateComment, useDeleteComment } from '../hooks/use-comments';

const getAuthorName = (comment) => {
  const user = comment?.user;
  if (!user) return 'Usuario';
  return (
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    'Usuario'
  );
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const time = new Date(timestamp);
  const diffMins = Math.floor((now - time) / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return time.toLocaleDateString();
};

// Flattens the reply tree into a single list; anything nested under a root
// is shown at one indent level (Instagram-style) instead of a deep staircase.
const flattenTree = (roots) => {
  const flat = [];
  roots.forEach((root) => {
    flat.push({ ...root, depth: 0 });
    const walk = (node) => {
      (node.replies || []).forEach((reply) => {
        flat.push({ ...reply, depth: 1 });
        walk(reply);
      });
    };
    walk(root);
  });
  return flat;
};

export const CommentsModal = ({ visible, postId, onClose }) => {
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const { data, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const flatComments = useMemo(() => flattenTree(data?.data || []), [data]);

  const handleSend = () => {
    const content = text.trim();
    if (!content || !user?.id || createComment.isPending) return;

    createComment.mutate(
      { postId, userId: user.id, content, parentId: replyingTo?.id },
      {
        onSuccess: () => {
          setText('');
          setReplyingTo(null);
        },
        onError: () => {
          Alert.alert('Error', 'No se pudo publicar el comentario. Inténtalo de nuevo.');
        },
      }
    );
  };

  const handleDelete = (comment) => {
    Alert.alert(
      'Eliminar comentario',
      '¿Seguro que quieres eliminar este comentario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteComment.mutate({ commentId: comment.id, userId: user.id, postId }),
        },
      ]
    );
  };

  const renderComment = ({ item: comment }) => (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginLeft: comment.depth * 36,
      }}
    >
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginRight: 10
      }}>
        {comment.user?.avatarUrl ? (
          <Image source={{ uri: comment.user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text style={{ fontWeight: '700', color: '#6b7280', fontSize: 13 }}>
            {getAuthorName(comment).charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: '#111827', lineHeight: 18 }}>
          <Text style={{ fontWeight: '700' }}>{getAuthorName(comment)} </Text>
          {comment.content}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 16 }}>
          <Text style={{ fontSize: 11, color: '#9ca3af' }}>{getTimeAgo(comment.createdAt)}</Text>
          <TouchableOpacity
            onPress={() => setReplyingTo({ id: comment.id, authorName: getAuthorName(comment) })}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280' }}>Responder</Text>
          </TouchableOpacity>
          {comment.userId === user?.id && (
            <TouchableOpacity onPress={() => handleDelete(comment)}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#ef4444' }}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {/* Carries its own provider so insets resolve wherever this is mounted,
          including from inside another Modal (iOS has no hardware back). */}
      <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6'
        }}>
          <View style={{ width: 40 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Comentarios</Text>
          <TouchableOpacity onPress={onClose} style={{ width: 40, alignItems: 'flex-end' }}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          {isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
            </View>
          ) : (
            <FlatList
              data={flatComments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                  <Ionicons name="chatbubble-outline" size={36} color="#d1d5db" />
                  <Text style={{ marginTop: 12, fontSize: 14, color: '#9ca3af' }}>
                    Sé el primero en comentar
                  </Text>
                </View>
              }
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* Reply banner */}
          {replyingTo && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: '#f9fafb',
              borderTopWidth: 1,
              borderTopColor: '#f3f4f6'
            }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                Respondiendo a <Text style={{ fontWeight: '700' }}>{replyingTo.authorName}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderTopWidth: replyingTo ? 0 : 1,
            borderTopColor: '#f3f4f6',
            gap: 8
          }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escribe un comentario..."
              placeholderTextColor="#9ca3af"
              multiline
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 14,
                color: '#111827',
                maxHeight: 100
              }}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim() || createComment.isPending}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: text.trim() ? colors.primary[500] : '#e5e7eb'
              }}
            >
              {createComment.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="arrow-up" size={18} color={text.trim() ? '#ffffff' : '#9ca3af'} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

export default CommentsModal;
