import { ActivityIndicator, Image, Linking, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../shared/components/ui/text';
import { resolveMediaUrl } from '../../../shared/utils/media-url';

const COVER_HEIGHT = 200;
const AVATAR_SIZE = 128;

// "0414-123.45.67" → "584141234567" for wa.me links
const toWhatsAppNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('58')) return digits;
  if (digits.startsWith('0')) return `58${digits.slice(1)}`;
  return digits;
};

function DetailRow({ icon, children, onPress }) {
  const Row = onPress ? TouchableOpacity : View;
  return (
    <Row onPress={onPress} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 }}>
      <Ionicons name={icon} size={20} color="#64748b" style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>{children}</View>
    </Row>
  );
}

/**
 * Facebook-style business header: full-width cover, round logo overlapping it,
 * name, quick stats, description, action buttons and a "Detalles" section.
 * Used by the owner's profile (editable) and by clients viewing a business.
 *
 * @param {Object} business - { name, category, isVerified, description, logoUrl, bannerUrl, address, hours, phone }
 * @param {Array}  stats    - [{ label, singular?, value, icon? }] shown inline under the name
 * @param {Array}  actions  - [{ label, icon, onPress, primary }] buttons under the description
 * @param {Object} edit     - optional { onEditLogo, onEditCover, uploadingLogo, uploadingCover }
 * @param {Node}   coverOverlay - optional buttons drawn over the cover (back, settings…)
 * @param {Array}  details  - optional custom "Detalles" rows [{ icon, label?, value, onPress? }]
 *                            used instead of the business ones (e.g. for a client's own profile)
 */
export function BusinessProfileHeader({ business, stats = [], actions = [], edit, coverOverlay, details }) {
  const banner = resolveMediaUrl(business?.bannerUrl);
  const logo = resolveMediaUrl(business?.logoUrl);
  const name = business?.name || 'Negocio';
  const phone = business?.phone;

  return (
    <View style={{ backgroundColor: '#ffffff' }}>
      {/* Cover */}
      <View style={{ height: COVER_HEIGHT, backgroundColor: '#e5e7eb' }}>
        {banner ? (
          <Image source={{ uri: banner }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#f87171', '#b91c1c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
        )}

        {edit?.onEditCover && (
          <TouchableOpacity
            onPress={edit.onEditCover}
            disabled={edit.uploadingCover}
            activeOpacity={0.8}
            style={{
              position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.92)',
            }}
          >
            {edit.uploadingCover ? <ActivityIndicator size="small" color="#111827" /> : <Ionicons name="camera" size={16} color="#111827" />}
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>Editar portada</Text>
          </TouchableOpacity>
        )}

        {coverOverlay}
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* Round logo overlapping the cover */}
        <View style={{ marginTop: -AVATAR_SIZE / 2, width: AVATAR_SIZE, height: AVATAR_SIZE }}>
          <View style={{
            width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 4, borderColor: '#ffffff',
            backgroundColor: '#ef4444', overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
          }}>
            {logo ? (
              <Image source={{ uri: logo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 48, fontWeight: '800', color: '#ffffff' }}>{name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          {edit?.onEditLogo && (
            <TouchableOpacity
              onPress={edit.onEditLogo}
              disabled={edit.uploadingLogo}
              accessibilityLabel="Cambiar logo"
              style={{
                position: 'absolute', right: 4, bottom: 4, width: 36, height: 36, borderRadius: 18,
                backgroundColor: '#e5e7eb', borderWidth: 3, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {edit.uploadingLogo ? <ActivityIndicator size="small" color="#111827" /> : <Ionicons name="camera" size={16} color="#111827" />}
            </TouchableOpacity>
          )}
        </View>

        {/* Name + verified */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#0f172a', flexShrink: 1 }}>{name}</Text>
          {business?.isVerified && <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />}
        </View>

        {/* Inline stats, like "1 seguidor · 8 productos" */}
        {stats.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
            {stats.map((stat, index) => (
              <TouchableOpacity
                key={stat.label}
                onPress={stat.onPress}
                disabled={!stat.onPress}
                activeOpacity={0.6}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                {index > 0 && <Text style={{ color: '#94a3b8', marginHorizontal: 6 }}>·</Text>}
                {stat.icon && <Ionicons name={stat.icon} size={14} color="#f59e0b" style={{ marginRight: 3 }} />}
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>{stat.value}</Text>
                <Text style={{ fontSize: 15, color: '#64748b' }}> {Number(stat.value) === 1 && stat.singular ? stat.singular : stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Description */}
        {!!business?.description && (
          <Text style={{ fontSize: 15, color: '#334155', lineHeight: 21, marginTop: 10 }}>{business.description}</Text>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={action.onPress}
                activeOpacity={0.85}
                style={{
                  flex: action.iconOnly ? 0 : 1, minWidth: action.iconOnly ? 44 : undefined, height: 40, borderRadius: 10,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: action.iconOnly ? 12 : 8,
                  backgroundColor: action.primary ? '#ef4444' : '#e5e7eb',
                }}
              >
                {action.icon && <Ionicons name={action.icon} size={17} color={action.primary ? '#ffffff' : '#111827'} />}
                {!action.iconOnly && (
                  <Text style={{ fontSize: 14, fontWeight: '700', color: action.primary ? '#ffffff' : '#111827' }}>{action.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Details */}
      <View style={{ height: 8, backgroundColor: '#f1f5f9', marginTop: 16 }} />
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 }}>Detalles</Text>

        {details && details.filter((d) => d.value).map((d) => (
          <DetailRow key={d.icon + d.value} icon={d.icon} onPress={d.onPress}>
            <Text style={{ fontSize: 15, color: '#334155' }}>
              {!!d.label && <Text style={{ fontWeight: '700', color: '#0f172a' }}>{d.label} · </Text>}
              {d.value}
            </Text>
          </DetailRow>
        ))}
        {details && !details.some((d) => d.value) && (
          <Text style={{ fontSize: 14, color: '#94a3b8', paddingVertical: 8 }}>Sin datos todavía.</Text>
        )}

        {!details && (
        <>

        {!!business?.category && (
          <DetailRow icon="pricetag-outline">
            <Text style={{ fontSize: 15, color: '#334155' }}>
              <Text style={{ fontWeight: '700', color: '#0f172a' }}>Categoría</Text> · {business.category}
            </Text>
          </DetailRow>
        )}

        {!!business?.address && (
          <DetailRow
            icon="location-outline"
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`).catch(() => {})}
          >
            <Text style={{ fontSize: 15, color: '#334155' }}>{business.address}</Text>
          </DetailRow>
        )}

        {!!business?.hours && (
          <DetailRow icon="time-outline">
            <Text style={{ fontSize: 15, color: '#334155' }}>
              <Text style={{ fontWeight: '700', color: '#0f172a' }}>Horario</Text> · {business.hours}
            </Text>
          </DetailRow>
        )}

        {!!phone && (
          <DetailRow icon="call-outline">
            <Text style={{ fontSize: 15, color: '#334155' }}>{phone}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${phone}`).catch(() => {})}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#eff6ff' }}
              >
                <Ionicons name="call" size={14} color="#2563eb" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563eb' }}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/${toWhatsAppNumber(phone)}`).catch(() => {})}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#ecfdf5' }}
              >
                <Ionicons name="logo-whatsapp" size={14} color="#059669" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </DetailRow>
        )}

        {!business?.address && !business?.hours && !phone && !business?.category && (
          <Text style={{ fontSize: 14, color: '#94a3b8', paddingVertical: 8 }}>Sin datos de contacto todavía.</Text>
        )}
        </>
        )}
      </View>
      <View style={{ height: 8, backgroundColor: '#f1f5f9' }} />
    </View>
  );
}

export default BusinessProfileHeader;
