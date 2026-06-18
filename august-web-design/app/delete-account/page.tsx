'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useRouter } from 'next/navigation';
import styles from './delete-account.module.css';

export default function DeleteAccount() {
  const router = useRouter();
  const [inputType, setInputType] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleInputTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInputType: 'phone' | 'email' | null
  ) => {
    if (newInputType !== null) {
      setInputType(newInputType);
      setError('');
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputType === 'phone' && !phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    if (inputType === 'email' && !email) {
      setError('Please enter your email address');
      return;
    }

    if (inputType === 'email' && !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!confirmDelete) {
      setError('Please confirm that you want to delete your account');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const requestBody = inputType === 'phone'
        ? { phoneNumber: '+' + phoneNumber.replace(/\D/g, '') }
        : { email: email.trim() };

      const response = await fetch(`/api/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to request account deletion');
      }

      setRequestSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (requestSubmitted) {
    return (
      <Container maxWidth="sm" className={styles.container}>
        <Box className={styles.logoContainer}>
          <img
            src="https://augustbuckets.blob.core.windows.net/tenant-assets/august/logo.svg"
            alt="August Logo"
            className={styles.logo}
          />
        </Box>

        <Paper elevation={0} className={styles.paper}>
          <Typography variant="h4" component="h1" className={styles.title}>
            Request Submitted
          </Typography>

          <Typography variant="body1" className={`${styles.description} ${styles.confirmationText}`}>
            We have registered your request for deletion of your account and all your information.
            To confirm the process kindly send out an email to <a href="mailto:contact@getbeyondhealth.com"><strong>contact@getbeyondhealth.com</strong></a> with the phone number or email address associated with your account.
          </Typography>

          <Box className={styles.centeredButtonGroup} sx={{ marginTop: '2rem' }}>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              className={styles.backButton}
              sx={{ maxWidth: '200px' }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" className={styles.container}>
      <Box className={styles.logoContainer}>
        <img
          src="https://augustbuckets.blob.core.windows.net/tenant-assets/august/logo.svg"
          alt="August Logo"
          className={styles.logo}
        />
      </Box>

      <Paper elevation={0} className={styles.paper}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Delete Account
        </Typography>

        <Typography variant="body1" className={styles.description}>
          We're sorry to see you go. Once your account is deleted, all your data will be permanently removed from our systems.
        </Typography>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Box className={styles.formGroup}>
            <ToggleButtonGroup
              value={inputType}
              exclusive
              onChange={handleInputTypeChange}
              aria-label="input type"
              sx={{
                width: '100%',
                marginBottom: '16px',
                '& .MuiToggleButton-root': {
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '14px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgb(231,231,233)',
                  '&.Mui-selected': {
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="phone">Phone Number</ToggleButton>
              <ToggleButton value="email">Email Address</ToggleButton>
            </ToggleButtonGroup>

            {inputType === 'phone' ? (
              <>
                <Typography variant="body2" className={styles.inputLabel}>
                  Phone Number
                </Typography>
                <Box className={styles.phoneInputContainer}>
                  <PhoneInput
                    country={'in'}
                    countryCodeEditable={false}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    inputClass={styles.phoneInput}
                    containerClass={styles.phoneInputWrapper}
                    buttonClass={styles.phoneDropdownButton}
                    containerStyle={{ border: 'none' }}
                    inputStyle={{
                      width: '100%',
                      height: '56px',
                      fontSize: '16px',
                      borderRadius: '14px',
                      paddingLeft: '72px'
                    }}
                    buttonStyle={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderRight: '1px solid rgb(231,231,233) !important',
                      borderRadius: '14px',
                      borderTopRightRadius: '0px',
                      borderBottomRightRadius: '0px',
                      paddingRight: '10px',
                      paddingLeft: '10px'
                    }}
                  />
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2" className={styles.inputLabel}>
                  Email Address
                </Typography>
                <TextField
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      height: '56px',
                      '& fieldset': {
                        borderColor: 'rgb(231,231,233)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgb(200,200,200)',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '16px',
                    },
                  }}
                />
              </>
            )}
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
                color="primary"
              />
            }
            label="I understand that this action cannot be undone and all my data will be permanently deleted."
            className={styles.checkbox}
          />

          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            className={styles.deleteButton}
            disabled={isLoading || !confirmDelete}
          >
            {isLoading ? (
              <Box className={styles.buttonContent}>
                <CircularProgress size={20} color="inherit" />
                <span>Processing...</span>
              </Box>
            ) : (
              'Delete Account'
            )}
          </Button>
          <Box className={styles.buttonGroup}>
            <Button
              variant="outlined"
              onClick={handleGoBack}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </Button>

          </Box>
        </form>
      </Paper>
    </Container>
  );
}
