export const formatCurrency = (value) => {
  if (!value && value !== 0) return '';
  
  // Converter para número se for string
  const numberValue = typeof value === 'string' ? 
    parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) : 
    value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numberValue);
};

export const parseCurrency = (value) => {
  if (!value) return 0;
  // Remover R$ e converter para número
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
};

// Máscara para input de preço
export const currencyMask = (value) => {
  if (!value) return '';
  
  // Manter apenas números e vírgula
  let cleaned = value.replace(/[^\d,]/g, '');
  
  // Garantir que há apenas uma vírgula
  const parts = cleaned.split(',');
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }
  
  // Formatar como moeda brasileira
  if (cleaned.includes(',')) {
    const [reais, centavos] = cleaned.split(',');
    return `R$ ${reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos.slice(0, 2)}`;
  } else if (cleaned) {
    return `R$ ${cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }
  
  return '';
};