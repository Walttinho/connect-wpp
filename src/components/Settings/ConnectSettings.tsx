// src/components/Settings/ConnectSettings.tsx
import React, { useState, useEffect } from 'react';
import { Settings, Save, TestTube, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { AMAZON_CONNECT_CONFIG, ConnectConfigUtils } from '../../config/amazonConnect';
import { AmazonConnectService } from '../../services/amazonConnectService';
import { AmazonConnectChatService } from '../../services/amazonConnectChatService';

interface ConnectSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConnectionStatus {
  ccp: 'idle' | 'testing' | 'success' | 'error';
  chat: 'idle' | 'testing' | 'success' | 'error';
  voice: 'idle' | 'testing' | 'success' | 'error';
}

export const ConnectSettings: React.FC<ConnectSettingsProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({
    instanceUrl: AMAZON_CONNECT_CONFIG.INSTANCE_URL,
    contactFlowId: AMAZON_CONNECT_CONFIG.CONTACT_FLOW_ID,
    region: AMAZON_CONNECT_CONFIG.REGION,
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    ccp: 'idle',
    chat: 'idle',
    voice: 'idle'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Carrega configurações salvas do localStorage
      const savedConfig = localStorage.getItem('amazon_connect_config');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Erro ao carregar configurações:', error);
        }
      }
    }
  }, [isOpen]);

  const validateConfig = () => {
    const newErrors: Record<string, string> = {};

    if (!config.instanceUrl.trim()) {
      newErrors.instanceUrl = 'URL da instância é obrigatória';
    } else if (!config.instanceUrl.includes('.my.connect.aws')) {
      newErrors.instanceUrl = 'URL deve ser uma instância válida do Amazon Connect';
    }

    if (!config.contactFlowId.trim()) {
      newErrors.contactFlowId = 'ID do Contact Flow é obrigatório';
    }

    if (!config.region.trim()) {
      newErrors.region = 'Região AWS é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testCCPConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, ccp: 'testing' }));
    
    try {
      const connectService = AmazonConnectService.getInstance();
      
      // Cria um container temporário para teste
      const testContainer = document.createElement('div');
      testContainer.style.display = 'none';
      document.body.appendChild(testContainer);

      await connectService.initializeCCP(testContainer);
      
      // Remove container de teste
      document.body.removeChild(testContainer);
      
      setConnectionStatus(prev => ({ ...prev, ccp: 'success' }));
    } catch (error) {
      console.error('Erro no teste CCP:', error);
      setConnectionStatus(prev => ({ ...prev, ccp: 'error' }));
    }
  };

  const testChatConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, chat: 'testing' }));
    
    try {
      const chatService = AmazonConnectChatService.getInstance();
      
      // Testa apenas a configuração básica
      const testAttributes = { 'TestConnection': 'true' };
      await chatService.startChatSession(testAttributes);
      
      // Finaliza o teste imediatamente
      await chatService.endChatSession();
      
      setConnectionStatus(prev => ({ ...prev, chat: 'success' }));
    } catch (error) {
      console.error('Erro no teste Chat:', error);
      setConnectionStatus(prev => ({ ...prev, chat: 'error' }));
    }
  };

  const testVoiceConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, voice: 'testing' }));
    
    try {
      const connectService = AmazonConnectService.getInstance();
      const agentStatus = await connectService.getAgentStatus();
      
      if (agentStatus) {
        setConnectionStatus(prev => ({ ...prev, voice: 'success' }));
      } else {
        throw new Error('Agente não disponível');
      }
    } catch (error) {
      console.error('Erro no teste Voice:', error);
      setConnectionStatus(prev => ({ ...prev, voice: 'error' }));
    }
  };

  const runAllTests = async () => {
    if (!validateConfig()) return;

    setConnectionStatus({
      ccp: 'testing',
      chat: 'testing',
      voice: 'testing'
    });

    // Executa testes em paralelo
    await Promise.allSettled([
      testCCPConnection(),
      testChatConnection(),
      testVoiceConnection()
    ]);
  };

  const saveConfiguration = async () => {
    if (!validateConfig()) return;

    setIsSaving(true);
    
    try {
      // Salva no localStorage
      localStorage.setItem('amazon_connect_config', JSON.stringify(config));
      
      // Atualiza configuração global
      Object.assign(AMAZON_CONNECT_CONFIG, {
        INSTANCE_URL: config.instanceUrl,
        CONTACT_FLOW_ID: config.contactFlowId,
        REGION: config.region,
        CCP_URL: `${config.instanceUrl}ccp-v2/`
      });

      // Simula salvamento no backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Configurações salvas com sucesso!');
      onClose();
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: ConnectionStatus[keyof ConnectionStatus]) => {
    switch (status) {
      case 'testing':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: ConnectionStatus[keyof ConnectionStatus]) => {
    switch (status) {
      case 'testing':
        return 'Testando...';
      case 'success':
        return 'Conectado';
      case 'error':
        return 'Erro';
      default:
        return 'Não testado';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-500 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Configurações Amazon Connect</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Configurações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Configurações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Instância Amazon Connect
              </label>
              <input
                type="url"
                value={config.instanceUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, instanceUrl: e.target.value }))}
                placeholder="https://exemplo.my.connect.aws/"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.instanceUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.instanceUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.instanceUrl}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Contact Flow
              </label>
              <input
                type="text"
                value={config.contactFlowId}
                onChange={(e) => setConfig(prev => ({ ...prev, contactFlowId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactFlowId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.contactFlowId && (
                <p className="text-sm text-red-600 mt-1">{errors.contactFlowId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Região AWS
              </label>
              <select
                value={config.region}
                onChange={(e) => setConfig(prev => ({ ...prev, region: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.region ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma região</option>
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
                <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
              </select>
              {errors.region && (
                <p className="text-sm text-red-600 mt-1">{errors.region}</p>
              )}
            </div>
          </div>

          {/* Status das Conexões */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Status das Conexões</h3>
              <button
                onClick={runAllTests}
                disabled={!ConnectConfigUtils.validateConfig()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <TestTube className="w-4 h-4" />
                <span>Testar Todas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">CCP (Control Panel)</span>
                  {getStatusIcon(connectionStatus.ccp)}
                </div>
                <p className="text-sm text-gray-600">{getStatusText(connectionStatus.ccp)}</p>
                <button
                  onClick={testCCPConnection}
                  disabled={connectionStatus.ccp === 'testing'}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  Testar CCP
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Chat</span>
                  {getStatusIcon(connectionStatus.chat)}
                </div>
                <p className="text-sm text-gray-600">{getStatusText(connectionStatus.chat)}</p>
                <button
                  onClick={testChatConnection}
                  disabled={connectionStatus.chat === 'testing'}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  Testar Chat
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Voz</span>
                  {getStatusIcon(connectionStatus.voice)}
                </div>
                <p className="text-sm text-gray-600">{getStatusText(connectionStatus.voice)}</p>
                <button
                  onClick={testVoiceConnection}
                  disabled={connectionStatus.voice === 'testing'}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  Testar Voz
                </button>
              </div>
            </div>
          </div>

          {/* Configurações Avançadas */}
          <div className="space-y-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAdvanced ? '▼' : '▶'} Configurações Avançadas
            </button>

            {showAdvanced && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de Chamada (ms)
                    </label>
                    <input
                      type="number"
                      defaultValue={AMAZON_CONNECT_CONFIG.CALL_SETTINGS.CALL_TIMEOUT}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração Máxima (ms)
                    </label>
                    <input
                      type="number"
                      defaultValue={AMAZON_CONNECT_CONFIG.CALL_SETTINGS.MAX_CALL_DURATION}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      defaultChecked={AMAZON_CONNECT_CONFIG.CCP_OPTIONS.loginPopup}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Habilitar popup de login</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      defaultChecked={AMAZON_CONNECT_CONFIG.CCP_OPTIONS.softphone.allowFramedSoftphone}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Permitir telefone em frame</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Informações de Debug */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Informações de Debug</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>CCP URL: {config.instanceUrl}ccp-v2/</p>
              <p>Streams API: {AMAZON_CONNECT_CONFIG.STREAMS_API_URL}</p>
              <p>Configuração válida: {ConnectConfigUtils.validateConfig() ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Configure sua instância Amazon Connect para habilitar chat e voz
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveConfiguration}
                disabled={isSaving || !ConnectConfigUtils.validateConfig()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};