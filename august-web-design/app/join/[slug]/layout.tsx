import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Customize metadata based on the slug
  const getMetadataForSlug = (slug: string) => {
    switch (slug) {
      case 'wa':
        return {
          title: 'Connect with August AI on WhatsApp',
          description: 'Get instant wellness support and guidance through WhatsApp. Join thousands who trust August AI for their mental health journey.',
          image: 'https://augustbuckets.blob.core.windows.net/web-app-assets/join-august.png',
        };
      case 'app':
        return {
          title: 'Download August AI Wellness App',
          description: 'Your personal AI wellness companion. Download the August app for personalized health support, lab report analysis, and wellness tracking.',
          image: 'https://augustbuckets.blob.core.windows.net/web-app-assets/join-august.png',
        };
      default:
        return {
          title: 'August AI - Your Wellness Companion',
          description: 'Join August AI for personalized wellness support and mental health guidance.',
          image: 'https://augustbuckets.blob.core.windows.net/web-app-assets/join-august.png',
        };
    }
  };

  const meta = getMetadataForSlug(slug);

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://www.meetaugust.ai/join/${slug}`,
      siteName: 'August AI',
      images: [
        {
          url: meta.image,
          width: 1200,
          height: 811,
          alt: meta.title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
