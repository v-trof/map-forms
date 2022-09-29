export const useTranslation = () => (key: string, params?: object) =>
  params
    ? `${key}|${Object.entries(params)
        .map(([k, v]) => `${k}:${v}`)
        .join(' ')}`
    : key;
