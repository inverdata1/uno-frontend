/**
 * Ways a business can get paid. Each type lists the form fields it uses;
 * `required` mirrors the backend validation.
 */
export const ACCOUNT_TYPES = {
  pago_movil: {
    label: 'Pago móvil',
    icon: 'phone-portrait-outline',
    color: '#0ea5e9',
    fields: [
      { key: 'bankName', label: 'Banco', placeholder: 'Ej: Banesco (0134)', required: true },
      { key: 'phone', label: 'Teléfono', placeholder: '0414-1234567', keyboardType: 'phone-pad', required: true },
      { key: 'documentId', label: 'Cédula o RIF', placeholder: 'V-12345678', required: true },
      { key: 'holderName', label: 'Titular (opcional)', placeholder: 'Nombre del titular' },
    ],
  },
  zelle: {
    label: 'Zelle',
    icon: 'swap-horizontal-outline',
    color: '#7c3aed',
    hint: 'Indica el correo o el teléfono asociado a Zelle.',
    fields: [
      { key: 'holderName', label: 'Titular', placeholder: 'Nombre como aparece en Zelle', required: true },
      { key: 'email', label: 'Correo', placeholder: 'correo@ejemplo.com', keyboardType: 'email-address' },
      { key: 'phone', label: 'Teléfono', placeholder: '+1 555 123 4567', keyboardType: 'phone-pad' },
    ],
  },
  binance: {
    label: 'Binance',
    icon: 'logo-bitcoin',
    color: '#f0b90b',
    hint: 'Indica el Pay ID o el correo de Binance.',
    fields: [
      { key: 'accountId', label: 'Binance Pay ID', placeholder: '123456789', keyboardType: 'number-pad' },
      { key: 'email', label: 'Correo', placeholder: 'correo@ejemplo.com', keyboardType: 'email-address' },
      { key: 'holderName', label: 'Usuario (opcional)', placeholder: 'Nombre de usuario' },
    ],
  },
};

export const ACCOUNT_TYPE_IDS = Object.keys(ACCOUNT_TYPES);

export const getAccountType = (type) => ACCOUNT_TYPES[type] || { label: type, icon: 'wallet-outline', color: '#6b7280', fields: [] };

/**
 * The filled-in fields of an account as [{ label, value }], in form order.
 */
export const getAccountRows = (account) =>
  getAccountType(account?.type)
    .fields.filter((f) => account?.[f.key])
    .map((f) => ({ key: f.key, label: f.label.replace(' (opcional)', ''), value: account[f.key] }));

/**
 * One line summary for lists, e.g. "Banesco · 0414-1234567".
 */
export const getAccountSummary = (account) =>
  getAccountRows(account)
    .slice(0, 2)
    .map((r) => r.value)
    .join(' · ');

/**
 * Plain text with every detail, for copying all at once.
 */
export const getAccountText = (account) =>
  [
    getAccountType(account?.type).label,
    ...(account?.amount ? [`Monto: ${formatAmount(account.amount, account.currency)}`] : []),
    ...getAccountRows(account).map((r) => `${r.label}: ${r.value}`),
  ].join('\n');

// Pago móvil is paid in bolívares; Zelle and Binance in dollars
export const getAccountCurrency = (type) => (type === 'pago_movil' ? 'VES' : 'USD');

export const CURRENCY_SYMBOL = { VES: 'Bs', USD: '$' };

/**
 * "Bs 1.234,56" or "$1,234.56".
 */
export const formatAmount = (amount, currency) => {
  const n = Number(amount) || 0;
  if (currency === 'VES') {
    return `Bs ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * The amount as banks expect it typed: "1234,56" for Bs, "1234.56" for $.
 */
export const amountForCopy = (amount, currency) => {
  const fixed = (Number(amount) || 0).toFixed(2);
  return currency === 'VES' ? fixed.replace('.', ',') : fixed;
};

/**
 * Reads what the user typed. Bs follows the Venezuelan format ("1.234,56"),
 * dollars the US one ("1,234.56"), and a lone separator followed by one or two
 * digits is read as decimals either way ("25,5" / "25.5").
 * Returns null when it is not a positive amount.
 */
export const parseAmountInput = (text, currency = 'USD') => {
  const clean = String(text || '').trim().replace(/[^\d.,]/g, '');
  const [thousands, decimal] = currency === 'VES' ? ['.', ','] : [',', '.'];

  let normalized;
  if (clean.includes(decimal)) {
    normalized = clean.split(thousands).join('').replace(decimal, '.');
  } else {
    const groups = clean.split(thousands);
    const last = groups.pop();
    // "25.5" in Bs or "25,50" in $: the thousands mark used as a decimal point
    normalized = groups.length && /^\d{1,2}$/.test(last) ? `${groups.join('')}.${last}` : `${groups.join('')}${last}`;
  }

  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
};

/**
 * The fields of an account worth sending in a chat message.
 */
export const toAccountPayload = (account, amount) => {
  const payload = { type: 'payment_account', accountType: account.type };
  if (amount) {
    payload.amount = amount;
    payload.currency = getAccountCurrency(account.type);
  }
  getAccountType(account.type).fields.forEach((f) => {
    if (account[f.key]) payload[f.key] = account[f.key];
  });
  return payload;
};

export const formatPeriod = (period) => {
  if (!period) return '';
  const [year, month] = period.split('-').map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};
