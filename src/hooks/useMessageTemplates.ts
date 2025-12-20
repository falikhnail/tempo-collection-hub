import { useState, useEffect } from 'react';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'default',
    name: 'Template Standar',
    content: `Halo {nama_toko},

Ini adalah pengingat untuk pembayaran piutang:
- ID Transaksi: {id_transaksi}
- Sisa Piutang: {sisa_piutang}
- Jatuh Tempo: {jatuh_tempo}

Mohon segera melakukan pembayaran. Terima kasih.

Salam,
FurniTrack`,
    isDefault: true,
  },
  {
    id: 'friendly',
    name: 'Template Ramah',
    content: `Selamat {waktu} {nama_toko} 👋

Semoga usahanya lancar ya! Kami ingin mengingatkan bahwa ada tagihan yang perlu diselesaikan:

📋 ID: {id_transaksi}
💰 Nominal: {sisa_piutang}
📅 Jatuh Tempo: {jatuh_tempo}

Jika sudah dibayar, mohon abaikan pesan ini. Terima kasih atas kerjasamanya! 🙏`,
    isDefault: false,
  },
  {
    id: 'formal',
    name: 'Template Formal',
    content: `Kepada Yth. {nama_toko}

Dengan hormat,

Bersama ini kami sampaikan pengingat pembayaran piutang dengan rincian sebagai berikut:

Nomor Transaksi: {id_transaksi}
Jumlah Terutang: {sisa_piutang}
Tanggal Jatuh Tempo: {jatuh_tempo}

Kami mohon pembayaran dapat segera dilakukan sebelum tanggal jatuh tempo.

Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.

Hormat kami,
Tim FurniTrack`,
    isDefault: false,
  },
];

const STORAGE_KEY = 'furnitrack_message_templates';
const ACTIVE_TEMPLATE_KEY = 'furnitrack_active_template';

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('default');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load templates from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_TEMPLATE_KEY);
    
    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } else {
      setTemplates(DEFAULT_TEMPLATES);
    }
    
    if (activeId) {
      setActiveTemplateId(activeId);
    }
    
    setIsLoaded(true);
  }, []);

  // Save templates to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  }, [templates, isLoaded]);

  // Save active template to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(ACTIVE_TEMPLATE_KEY, activeTemplateId);
    }
  }, [activeTemplateId, isLoaded]);

  const addTemplate = (template: Omit<MessageTemplate, 'id'>) => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template?.isDefault) return; // Don't delete default templates
    
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (activeTemplateId === id) {
      setActiveTemplateId('default');
    }
  };

  const resetToDefaults = () => {
    setTemplates(DEFAULT_TEMPLATES);
    setActiveTemplateId('default');
  };

  const getActiveTemplate = () => {
    return templates.find(t => t.id === activeTemplateId) || templates[0];
  };

  const formatMessage = (
    templateId: string | undefined,
    data: {
      nama_toko: string;
      id_transaksi: string;
      sisa_piutang: string;
      jatuh_tempo: string;
    }
  ) => {
    const template = templateId 
      ? templates.find(t => t.id === templateId) 
      : getActiveTemplate();
    
    if (!template) return '';

    const hour = new Date().getHours();
    let waktu = 'pagi';
    if (hour >= 11 && hour < 15) waktu = 'siang';
    else if (hour >= 15 && hour < 18) waktu = 'sore';
    else if (hour >= 18) waktu = 'malam';

    return template.content
      .replace(/{nama_toko}/g, data.nama_toko)
      .replace(/{id_transaksi}/g, data.id_transaksi)
      .replace(/{sisa_piutang}/g, data.sisa_piutang)
      .replace(/{jatuh_tempo}/g, data.jatuh_tempo)
      .replace(/{waktu}/g, waktu);
  };

  return {
    templates,
    activeTemplateId,
    setActiveTemplateId,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    resetToDefaults,
    getActiveTemplate,
    formatMessage,
    isLoaded,
  };
}
