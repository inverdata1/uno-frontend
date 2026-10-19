import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui/text';
import { useDeletePaymentAccount, usePaymentAccounts, useSavePaymentAccount } from '../../../shared/hooks/use-payments';
import {
  ACCOUNT_TYPE_IDS,
  ACCOUNT_TYPES,
  CURRENCY_SYMBOL,
  formatAmount,
  getAccountCurrency,
  getAccountSummary,
  getAccountType,
  parseAmountInput,
} from '../../../shared/utils/payment-accounts';

function AccountForm({ initialType, saving, onCancel, onSave }) {
  const [type, setType] = useState(initialType || 'pago_movil');
  const [values, setValues] = useState({});
  const config = ACCOUNT_TYPES[type];

  const missingRequired = config.fields.some((f) => f.required && !values[f.key]?.trim());
  const missingContact =
    (type === 'zelle' && !values.email?.trim() && !values.phone?.trim()) ||
    (type === 'binance' && !values.email?.trim() && !values.accountId?.trim());
  const canSave = !missingRequired && !missingContact && !saving;

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {ACCOUNT_TYPE_IDS.map((id) => {
          const t = ACCOUNT_TYPES[id];
          const active = type === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setType(id)}
              activeOpacity={0.8}
              style={{
                flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: 12,
                borderWidth: 2, borderColor: active ? '#ef4444' : '#e5e7eb', backgroundColor: active ? '#fef2f2' : '#ffffff',
              }}
            >
              <Ionicons name={t.icon} size={20} color={active ? '#ef4444' : t.color} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#ef4444' : '#374151' }}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {config.hint && <Text style={{ fontSize: 12, color: '#6b7280' }}>{config.hint}</Text>}

      {config.fields.map((field) => (
        <View key={`${type}-${field.key}`} style={{ gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>
            {field.label}{field.required ? ' *' : ''}
          </Text>
          <TextInput
            value={values[field.key] || ''}
            onChangeText={(text) => setValues((v) => ({ ...v, [field.key]: text }))}
            placeholder={field.placeholder}
            placeholderTextColor="#9ca3af"
            keyboardType={field.keyboardType || 'default'}
            autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
            style={{
              borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
              fontSize: 15, color: '#111827', backgroundColor: '#ffffff',
            }}
          />
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <TouchableOpacity
          onPress={onCancel}
          style={{ flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280' }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSave({ type, ...values })}
          disabled={!canSave}
          activeOpacity={0.85}
          style={{
            flex: 2, height: 46, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center',
            opacity: canSave ? 1 : 0.5,
          }}
        >
          {saving ? <ActivityIndicator color="#ffffff" /> : (
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Last step before sending an account in the chat: how much to pay, in Bs for
 * Pago móvil and in dollars for Zelle and Binance.
 */
function AmountStep({ account, suggestedUsdAmount, onBack, onSend }) {
  const currency = getAccountCurrency(account.type);
  const type = getAccountType(account.type);
  const suggestion = currency === 'USD' && suggestedUsdAmount ? Number(suggestedUsdAmount) : null;
  const [text, setText] = useState(suggestion ? suggestion.toFixed(2) : '');
  const amount = parseAmountInput(text, currency);

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' }}>
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${type.color}1A`, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={type.icon} size={20} color={type.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{type.label}</Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }} numberOfLines={1}>{getAccountSummary(account)}</Text>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>
          Monto a pagar en {currency === 'VES' ? 'bolívares (Bs)' : 'dólares ($)'}
        </Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: amount ? '#ef4444' : '#e5e7eb',
          borderRadius: 14, paddingHorizontal: 14, backgroundColor: '#ffffff',
        }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#6b7280', marginRight: 6 }}>{CURRENCY_SYMBOL[currency]}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={currency === 'VES' ? '0,00' : '0.00'}
            placeholderTextColor="#d1d5db"
            keyboardType="decimal-pad"
            autoFocus
            style={{ flex: 1, fontSize: 26, fontWeight: '800', color: '#111827', paddingVertical: 12 }}
          />
        </View>
        {currency === 'VES' ? (
          <Text style={{ fontSize: 12, color: '#6b7280' }}>Calcula el monto en bolívares con la tasa del día.</Text>
        ) : suggestion ? (
          <Text style={{ fontSize: 12, color: '#6b7280' }}>Total del pedido: {formatAmount(suggestion, 'USD')}</Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280' }}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSend(account, amount)}
          disabled={!amount}
          activeOpacity={0.85}
          style={{
            flex: 2, height: 46, borderRadius: 12, backgroundColor: '#ef4444', flexDirection: 'row',
            alignItems: 'center', justifyContent: 'center', gap: 6, opacity: amount ? 1 : 0.5,
          }}
        >
          <Ionicons name="paper-plane" size={16} color="#ffffff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>
            {amount ? `Enviar ${formatAmount(amount, currency)}` : 'Enviar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * "Bancos": the business' payment accounts.
 * With `onSelect` (chat wallet) tapping an account, or saving a new one, asks
 * for the amount and then sends it: onSelect(account, amount). Without it the
 * sheet just manages the list.
 */
export function PaymentAccountsSheet({ visible, onClose, businessId, onSelect, suggestedUsdAmount }) {
  const insets = useSafeAreaInsets();
  const { data: accounts = [], isLoading } = usePaymentAccounts(visible ? businessId : null);
  const saveAccount = useSavePaymentAccount();
  const deleteAccount = useDeletePaymentAccount();
  const [formType, setFormType] = useState(null); // null = list view
  const [pendingAccount, setPendingAccount] = useState(null); // account waiting for its amount

  // Reopening the sheet always starts from the list
  const close = () => {
    setFormType(null);
    setPendingAccount(null);
    onClose();
  };

  // Nothing saved yet: go straight to the form
  const showForm = formType || (!isLoading && accounts.length === 0);

  const handleSave = async (account) => {
    try {
      const saved = await saveAccount.mutateAsync({ businessId, ...account });
      setFormType(null);
      if (onSelect) setPendingAccount(saved);
    } catch (error) {
      const message = error?.response?.data?.message;
      Alert.alert('No se pudo guardar', typeof message === 'string' ? message : 'Revisa los datos e intenta de nuevo.');
    }
  };

  const handleDelete = (account) => {
    Alert.alert('Eliminar cuenta', `¿Eliminar ${getAccountType(account.type).label} · ${getAccountSummary(account)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteAccount.mutate(account.id) },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={close} />
          <View style={{
            backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 8, maxHeight: '88%',
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#d1d5db', alignSelf: 'center', marginBottom: 14 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="wallet" size={20} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>
                  {pendingAccount ? 'Monto a pagar' : showForm ? 'Agregar cuenta' : 'Bancos'}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {pendingAccount
                    ? 'Se enviará al cliente con los datos de la cuenta'
                    : showForm
                    ? onSelect ? 'Se guardará y se enviará al cliente' : 'Se guardará para usarla en tus chats'
                    : onSelect ? 'Toca una cuenta para enviarla al cliente' : 'Cuentas donde recibes tus pagos'}
                </Text>
              </View>
              <TouchableOpacity onPress={close} hitSlop={10}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {pendingAccount ? (
                <AmountStep
                  key={pendingAccount.id}
                  account={pendingAccount}
                  suggestedUsdAmount={suggestedUsdAmount}
                  onBack={() => setPendingAccount(null)}
                  onSend={(account, amount) => {
                    setPendingAccount(null);
                    onSelect(account, amount);
                  }}
                />
              ) : isLoading ? (
                <ActivityIndicator color="#ef4444" style={{ marginVertical: 24 }} />
              ) : showForm ? (
                <AccountForm
                  initialType={formType || 'pago_movil'}
                  saving={saveAccount.isPending}
                  onCancel={() => (accounts.length ? setFormType(null) : close())}
                  onSave={handleSave}
                />
              ) : (
                <View style={{ gap: 18 }}>
                  {ACCOUNT_TYPE_IDS.map((typeId) => {
                    const t = ACCOUNT_TYPES[typeId];
                    const list = accounts.filter((a) => a.type === typeId);
                    return (
                      <View key={typeId} style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t.label}
                          </Text>
                          <TouchableOpacity onPress={() => setFormType(typeId)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Ionicons name="add" size={16} color="#ef4444" />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444' }}>Agregar</Text>
                          </TouchableOpacity>
                        </View>

                        {list.length === 0 ? (
                          <Text style={{ fontSize: 13, color: '#9ca3af' }}>Sin cuentas de {t.label}</Text>
                        ) : (
                          list.map((account) => (
                            <TouchableOpacity
                              key={account.id}
                              onPress={() => (onSelect ? setPendingAccount(account) : null)}
                              activeOpacity={onSelect ? 0.8 : 1}
                              style={{
                                flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14,
                                backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb',
                              }}
                            >
                              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${t.color}1A`, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name={t.icon} size={20} color={t.color} />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
                                  {account.bankName || account.holderName || t.label}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#6b7280' }} numberOfLines={1}>{getAccountSummary(account)}</Text>
                              </View>
                              {onSelect && <Ionicons name="paper-plane" size={18} color="#ef4444" />}
                              <TouchableOpacity onPress={() => handleDelete(account)} hitSlop={10} style={{ padding: 4 }}>
                                <Ionicons name="trash-outline" size={18} color="#9ca3af" />
                              </TouchableOpacity>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default PaymentAccountsSheet;
