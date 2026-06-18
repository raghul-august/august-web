'use client';
import { Navbar } from '@/app/components/website/Navbar';
import HeroSection from './HeroSection';
import CategorySection from './CategorySection';
import Box from '@mui/material/Box';
import { Footer } from '@/app/components/website/Footer';

export default function PageLayout({ 
  heroProps,
  categoryData,
  isWebviewSource = false,
  hideFooter = false
}) {
  return (
    <div>
      <Navbar isWebviewSource={isWebviewSource} />
      <HeroSection {...heroProps} />
      <Box sx={{ bgcolor: 'white' }}>
        <CategorySection {...categoryData} />
      </Box>
      {!hideFooter && <Footer showLanguageSwitcher />}
    </div>
  );
}
