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

// Função para verificar se uma data é no futuro
export const isFutureDate = (dateString) => {
  return new Date(dateString) > new Date();
};

// Verificar se data/hora específica é no passado
export const isDateTimeInPast = (date, time) => {
  if (!date || !time) return false;
  
  const selectedDateTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  
  return selectedDateTime < now;
};

//alcular horário de término do serviço
export const calculateEndTime = (startTime, durationMinutes) => {
  if (!startTime || !durationMinutes) return '';
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(start.getTime() + (durationMinutes * 60000));
  
  return end.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

//Converter horário para minutos
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

//Converter minutos para horário
export const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};