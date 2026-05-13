import { api, handleApiError } from 'wasp/client/api';

type EmailSignupData = {
  email: string
  password: string
}

// PUBLIC API
export async function signup(data: EmailSignupData): Promise<{ success: boolean }> {
  try {
    const response = await api.post('/auth/email/signup', data);
    return response.data;
  } catch (e) {
    throw handleApiError(e);
  }
}
