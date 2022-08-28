export const useTranslation = () => (key: string, params?: any) => params ? `${key}|${Object.entries(params).map(([k,v]) => `${k}:${v}`).join(' ')}` : key;