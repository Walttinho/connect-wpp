// src/config/amazonConnect.ts
export const AMAZON_CONNECT_CONFIG = {
  // Configurações da instância Amazon Connect
  INSTANCE_URL: 'https://12162024walter.my.connect.aws/',
  CONTACT_FLOW_ID: '0b6d1298-e73a-422b-9db6-f62c8c5a74c0',
  REGION: 'us-east-1',
  
  // URLs importantes
  CCP_URL: 'https://12162024walter.my.connect.aws/ccp-v2/',
  STREAMS_API_URL: 'https://unpkg.com/amazon-connect-streams@2.18.4/release/connect-streams.js',
  
  // Configurações do CCP
  CCP_OPTIONS: {
    loginPopup: true,
    loginPopupAutoClose: true,
    loginOptions: {
      autoClose: true,
      height: 600,
      width: 400,
      top: 0,
      left: 0
    },
    softphone: {
      allowFramedSoftphone: true,
      disableRingtone: false,
      ringtoneUrl: null
    },
    pageOptions: {
      enableAudioDeviceSettings: true,
      enablePhoneTypeSettings: true
    }
  },
  
  // Mapeamento de status
  AGENT_STATUS_MAP: {
    'Available': 'available',
    'OnCall': 'busy',
    'Busy': 'busy',
    'Offline': 'offline',
    'AfterCallWork': 'busy'
  } as const,
  
  // Configurações de chamada
  CALL_SETTINGS: {
    DEFAULT_QUEUE_ID: null,
    CALL_TIMEOUT: 30000, // 30 segundos
    MAX_CALL_DURATION: 3600000, // 1 hora
  },
  
  // Atributos padrão para chamadas
  DEFAULT_CALL_ATTRIBUTES: {
    'Source': 'WhatsApp-Salesforce-Integration',
    'Application': 'WebApp',
    'Version': '1.0.0'
  }
};

// Tipos para TypeScript
export type AgentStatus = 'available' | 'busy' | 'offline';
export type CallStatus = 'connecting' | 'connected' | 'ended' | 'failed';

export interface ConnectCallAttributes {
  [key: string]: string;
}

// Utilitários de configuração
export const ConnectConfigUtils = {
  /**
   * Verifica se a configuração está válida
   */
  validateConfig(): boolean {
    const required = [
      AMAZON_CONNECT_CONFIG.INSTANCE_URL,
      AMAZON_CONNECT_CONFIG.CONTACT_FLOW_ID,
      AMAZON_CONNECT_CONFIG.REGION
    ];
    
    return required.every(config => config && config.length > 0);
  },

  /**
   * Gera URL completa do CCP
   */
  getCcpUrl(): string {
    return `${AMAZON_CONNECT_CONFIG.INSTANCE_URL}ccp-v2/`;
  },

  /**
   * Mapeia status do agente Amazon Connect para nosso formato
   */
  mapAgentStatus(connectStatus: string): AgentStatus {
    const mapped = AMAZON_CONNECT_CONFIG.AGENT_STATUS_MAP[connectStatus as keyof typeof AMAZON_CONNECT_CONFIG.AGENT_STATUS_MAP];
    return mapped || 'offline';
  },

  /**
   * Cria atributos de chamada com valores padrão
   */
  createCallAttributes(customAttributes: ConnectCallAttributes = {}): ConnectCallAttributes {
    return {
      ...AMAZON_CONNECT_CONFIG.DEFAULT_CALL_ATTRIBUTES,
      ...customAttributes,
      'Timestamp': new Date().toISOString()
    };
  },

  /**
   * Formata número de telefone para Amazon Connect
   */
  formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se começar com +55 (Brasil), mantém
    if (phone.startsWith('+55')) {
      return phone;
    }
    
    // Se começar com 55 e tiver mais de 11 dígitos, adiciona +
    if (cleaned.startsWith('55') && cleaned.length > 11) {
      return '+' + cleaned;
    }
    
    // Se for número brasileiro sem código do país, adiciona +55
    if (cleaned.length === 11 || cleaned.length === 10) {
      return '+55' + cleaned;
    }
    
    // Retorna como está se não conseguir identificar o padrão
    return phone;
  },

  /**
   * Valida se um número de telefone está no formato correto
   */
  isValidPhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    // Regex básica para números internacionais
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(formatted);
  }
};

// Constantes de erro
export const CONNECT_ERRORS = {
  NOT_INITIALIZED: 'Amazon Connect não foi inicializado',
  AGENT_NOT_AVAILABLE: 'Agente não está disponível para chamadas',
  INVALID_PHONE: 'Número de telefone inválido',
  CALL_FAILED: 'Falha ao iniciar chamada',
  CCP_LOAD_FAILED: 'Falha ao carregar Control Panel',
  PERMISSION_DENIED: 'Permissões negadas para microfone/alto-falante',
  NETWORK_ERROR: 'Erro de conexão com Amazon Connect'
} as const;

// Configuração de ambiente
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    enableDebugLogs: env === 'development',
    enableErrorReporting: env === 'production'
  };
};

export default AMAZON_CONNECT_CONFIG;