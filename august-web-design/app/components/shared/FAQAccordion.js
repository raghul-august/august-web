'use client';

import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { sanitizeAndSecureHtmlLinks } from '@/app/utils/sanitizeHtmlLinks';

export default function FAQAccordion({ faq, articleTitle }) {
  if (!faq || faq.length === 0) return null;

  return (
    <Box mt={5}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
          fontSize: { xs: '1.5rem', md: '1.65rem' },
          fontWeight: 700,
          color: '#1a1a1a',
          mb: 3,
          lineHeight: 1.25,
        }}
      >
        Frequently Asked Questions
      </Typography>
      {faq.map((item, idx) => (
        <Accordion
          key={idx}
          disableGutters
          sx={{
            mb: 1.5,
            borderRadius: '12px !important',
            boxShadow: "none",
            backgroundColor: "rgba(32, 110, 85, 0.03)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            border: "1px solid rgba(32, 110, 85, 0.08)",
            overflow: "hidden",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
            '&.Mui-expanded': {
              backgroundColor: "#fff",
              border: "1px solid rgba(0, 0, 0, 0.08)",
            },
            '&:before': { display: 'none' },
            "& .MuiTypography-root": { margin: 0, lineHeight: 1.4 },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#206E55' }} />}
            sx={{
              px: 2.5,
              py: 1,
              minHeight: 56,
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                my: 1,
              },
              '&:hover': { backgroundColor: 'rgba(32, 110, 85, 0.03)' },
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: '#1a1a1a' }}>
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
            <Box sx={{ borderTop: '1px solid rgba(32, 110, 85, 0.06)', pt: 2 }}>
              <div
                style={{ lineHeight: 1.8, fontSize: "0.95rem", color: '#444', fontFamily: "var(--font-manrope), 'Manrope', sans-serif" }}
                dangerouslySetInnerHTML={{ __html: sanitizeAndSecureHtmlLinks(item.answerHtml) }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
