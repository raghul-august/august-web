import axiosInstance from '@/lib/axios';
import { getActiveTenant } from '@/lib/tenant';
import logger from '@/utils/logger';
import { serializeError } from './error-reporter';
import type { PersonInfo } from '@/types/ehr';

interface GetPersonsResponse {
  success: boolean;
  persons: PersonInfo[];
  /** Server-authoritative, cross-device "user has engaged with EHR"
   *  signal (connected a provider, uploaded a report, or created a
   *  profile). Monotonic — once true, stays true. */
  ehr_onboarding_complete?: boolean;
}

export interface GetPersonsResult {
  persons: PersonInfo[];
  ehrOnboardingComplete: boolean;
}

interface CreatePersonResponse {
  success: boolean;
  personId: string;
  color: string;
  icon: string;
}

interface UpdatePersonResponse {
  success: boolean;
  person: {
    person_id: string;
    subject: string;
    given_name: string;
    age: string | null;
    sex: string | null;
  };
}

interface DeletePersonResponse {
  success: boolean;
  message: string;
}

export async function getPersons(): Promise<GetPersonsResult> {
  try {
    const url = `user/${getActiveTenant()}/ehr/get-persons`;
    const response = await axiosInstance.get<GetPersonsResponse>(url, {
      withCredentials: true,
    });
    return {
      persons: response.data.persons || [],
      ehrOnboardingComplete: !!response.data.ehr_onboarding_complete,
    };
  } catch (error) {
    logger.error('[Person] Error fetching persons', serializeError(error));
    throw error;
  }
}

export async function createPerson(input: {
  name: string;
  /** Optional; backend defaults if omitted. */
  relationship?: string;
  age?: string | number | null;
  sex?: string | null;
}): Promise<CreatePersonResponse> {
  try {
    const url = `user/${getActiveTenant()}/ehr/create-person`;
    const response = await axiosInstance.post<CreatePersonResponse>(url, input, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    logger.error('[Person] Error creating person', serializeError(error));
    throw error;
  }
}

export async function updatePerson(input: {
  personId: string;
  givenName?: string;
  age?: string;
  sex?: string;
}): Promise<UpdatePersonResponse> {
  try {
    const url = `user/${getActiveTenant()}/person`;
    const response = await axiosInstance.patch<UpdatePersonResponse>(url, input, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    logger.error('[Person] Error updating person', serializeError(error));
    throw error;
  }
}

export async function deletePerson(personId: string): Promise<DeletePersonResponse> {
  try {
    const url = `user/${getActiveTenant()}/person`;
    const response = await axiosInstance.delete<DeletePersonResponse>(url, {
      data: { personId },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    logger.error('[Person] Error deleting person', serializeError(error));
    throw error;
  }
}
