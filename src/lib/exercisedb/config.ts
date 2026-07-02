export const EXERCISEDB_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';

export const EXERCISEDB_BASE_URL = `https://${EXERCISEDB_HOST}/api/v1`;

export const getApiKey = (): string => {
  const key = import.meta.env.VITE_RAPIDAPI_KEY;

  if (!key) {
    console.warn(
      'RapidAPI key missing. Set VITE_RAPIDAPI_KEY in your .env file.',
    );
    throw new Error('VITE_RAPIDAPI_KEY is not configured');
  }

  return key;
};

export const buildHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'x-rapidapi-host': EXERCISEDB_HOST,
  'x-rapidapi-key': getApiKey(),
});
