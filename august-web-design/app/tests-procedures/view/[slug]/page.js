import { Navbar } from '@/app/components/website/Navbar';
import { getRedirectPath } from '@/app/utils/getRedirectPath';
export default function TestProcedurePage() {
  const params = useParams();
  const slug = params?.slug || '';
  const { language } = useLanguage();
  const testData = getTestBySlug(slug);

  if (!testData || !testData[language]) {
    return (
      <div>
        <Navbar />
        <Box sx={{ backgroundColor: 'var(--lib-bg-primary, #f4f5f5)', pt: 16, pb: 4 }}>
          <Container>
            <Typography variant="h4">
              {language === 'es' ? 'Prueba no encontrada' : 'Test not found'}
            </Typography>
          </Container>
        </Box>
      </div>
    );
  }

  const test = testData[language];

  // Rest of the component remains the same, but now uses the language-specific content
  return (
    <div>
      <Navbar />
      
      {/* Header Section */}
      <Box 
        sx={{ 
          backgroundColor: 'var(--lib-bg-primary, #f4f5f5)',
          pt: 16,
          pb: 6,
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link href={getRedirectPath(`/${language}/library`)} passHref style={{ textDecoration: 'none' }}>
              <MuiLink color="inherit" underline="hover">
                {language === 'es' ? 'Inicio' : 'Home'}
              </MuiLink>
            </Link>
            <Link href={getRedirectPath(`/${language}/tests-procedures`)} passHref style={{ textDecoration: 'none' }}>
              <MuiLink color="inherit" underline="hover">
                {language === 'es' ? 'Pruebas y Procedimientos' : 'Tests & Procedures'}
              </MuiLink>
            </Link>
            <Typography color="text.primary">{test.title}</Typography>
          </Breadcrumbs>

          {/* Title and Description */}
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              mb: 3
            }}
          >
            {test.title}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              mb: 4,
              maxWidth: '800px'
            }}
          >
            {test.description}
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: '800px' }}>
            <ContentSection sections={test.sections} />
          </Box>
        </Container>
      </Box>
    </div>
  );
} 