import type { MDXComponents } from 'mdx/types'
import { StoreButtons } from '@/app/components/website/StoreButtons'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-[40px] sm:text-[56px] lg:text-[72px] font-medium tracking-[-0.02em] mt-10 mb-4 text-dark max-w-4xl mx-auto text-center leading-[1.1]">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl md:text-2xl font-bold mt-8 mb-4 text-dark max-w-4xl">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg md:text-xl font-bold mt-8 mb-3 text-dark max-w-4xl">{children}</h3>,
    p: ({ children }) => <p className="mb-6 text-[15px] md:text-base text-dark/80 leading-[1.6] max-w-4xl">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 md:pl-8 mb-6 space-y-3 text-[15px] md:text-base text-dark/80 max-w-4xl leading-[1.6]">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 md:pl-8 mb-6 space-y-3 text-[15px] md:text-base text-dark/80 max-w-4xl leading-[1.6]">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    a: ({ href, children }) => <a href={href} className="text-primary-500 hover:text-primary-600 transition-colors">{children}</a>,
    strong: ({ children }) => <strong className="font-bold text-dark">{children}</strong>,
    StoreButtons: StoreButtons,
    ...components,
  }
}
