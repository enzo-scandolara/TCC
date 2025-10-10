  export const formatAppointmentDate = (dateString) => {
  const date = new Date(dateString);
  
  // Formatar data no padrão brasileiro
  const formattedDate = date.toLocaleDateString('pt-BR');
  
  // Formatar hora no padrão brasileiro (HH:MM)
  const formattedTime = date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  return {
    date: formattedDate,
    time: formattedTime,
    full: `${formattedDate} às ${formattedTime}`,
    datetime: date // Mantém o objeto Date original se necessário
  };
};

// Função para converter data+hora em string para o backend
export const createDateTimeString = (date, time) => {
  return `${date}T${time}:00`; // Formato: "YYYY-MM-DDTHH:MM:00"
};

// Função para obter data mínima para agendamento (hoje)
export const getMinDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Função para verificar se uma data é hoje
export const isToday = (dateString) => {
  const today = new Date().toDateString();
  const targetDate = new Date(dateString).toDateString();
  return today === targetDate;
};