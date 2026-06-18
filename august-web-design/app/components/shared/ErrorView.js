'use client';
import { Box, Container, Typography, Alert } from '@mui/material';
import { Navbar } from '@/app/components/website/Navbar';
import { useLanguage } from '../../contexts/LanguageContext';
import { Footer } from '@/app/components/website/Footer';

export default function ErrorView({ message }) {
  const { language } = useLanguage();

  return (
    <div>
      <Navbar />
      <Box sx={{ pt: 16, pb: 4 }}>
        <Container>
          <Alert severity="error" sx={{ mb: 2, fontFamily: "var(--font-manrope), 'Manrope', sans-serif" }}>
            {message || (language === 'es' ? 'Contenido no encontrado' : (language === 'fr' ? 'Contenu non trouvé' : 'Content not found'))}
          </Alert>
        </Container>
      </Box>
      <Footer showLanguageSwitcher />
    </div>
  );
}
