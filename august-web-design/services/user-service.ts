import axiosInstance from '@/lib/axios';
import { getActiveTenant } from '@/lib/tenant';
import { notifyError, serializeError } from './error-reporter';
import logger from '@/utils/logger';

export interface UserData {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  displayName?: string;
  alternativeContact?: string;
  [key: string]: unknown;
}

export interface GetUserDataResponse {
  success: boolean;
  user: UserData;
}

export interface UpdateUserMetadataResponse {
  success: boolean;
  message?: string;
}

export async function getUserData(): Promise<UserData | null> {
  try {
    const url = `/user/${getActiveTenant()}/get-user`;
    const response = await axiosInstance.get<GetUserDataResponse>(url);

    if (response.data.success) {
      return response.data.user;
    }
    return null;
  } catch (error) {
    const serialized = serializeError(error);
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status !== 401) {
      logger.error('Failed to fetch user data', serialized);
      void notifyError('Failed to fetch user data', {
        details: serialized,
      });
    }
    throw error;
  }
}

export async function updateUserDisplayName(name: string): Promise<boolean> {
  try {
    const url = `/user/${getActiveTenant()}/change-user`;
    const response = await axiosInstance.post<UpdateUserMetadataResponse>(url, {
      name,
    });

    return response.data.success;
  } catch (error) {
    const serialized = serializeError(error);
    logger.error('Failed to update user display name', serialized);
    void notifyError('Failed to update user display name', {
      details: serialized,
    });
    throw error;
  }
}

export async function updateUserMetadata(
  fieldName: string,
  fieldValue: string,
  tenant?: string
): Promise<boolean> {
  try {
    const url = `/user/${tenant ?? getActiveTenant()}/change-user-metadata`;
    const response = await axiosInstance.post<UpdateUserMetadataResponse>(url, {
      fieldName,
      fieldValue,
    });

    return response.data.success;
  } catch (error) {
    const serialized = serializeError(error);
    logger.error('Failed to update user metadata', serialized);
    void notifyError('Failed to update user metadata', {
      details: serialized,
    });
    throw error;
  }
}

export async function updateUserProfile(
  displayName: string,
  alternativeContact: string,
  isPhoneUser: boolean
): Promise<boolean> {
  try {
    const nameResult = await updateUserDisplayName(displayName);

    if (alternativeContact.trim()) {
      const fieldName = isPhoneUser ? 'email' : 'phoneNumber';
      await updateUserMetadata(fieldName, alternativeContact.trim());
    }

    return nameResult;
  } catch (error) {
    logger.error('Failed to update user profile', serializeError(error));
    throw error;
  }
}
