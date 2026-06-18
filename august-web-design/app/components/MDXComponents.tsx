'use client';
import Image from "next/image";

export const MDXComponents = {
  h1: (props: any) => <h1 className=" sm:text-[32px] text-[24px] md:text-[48px] font-bold my-9" {...props} />,
  h2: (props: any) => (
    <h2 className=" sm:text-[20px] text-[18px] md:text-[24px] text-[#333] font-bold mt-10 mb-4 " {...props} />
  ),
  p: (props: any) => (
    <p
      className=" leading-[1.7] my-5  text-[16px] font-sans text-[#121212BF]"
      {...props}
    />
  ),
  img: (props: any) => (
    <Image
      src={props.src}
      alt={props.alt || ""}
      width={800}
      height={500}
      className="rounded-lg my-6  "
    />
  ),
  a: (props: any) => (
    <a
      href={props.href}
      className="text-blue-600 hover:underline"
      target={props.href.startsWith("http") ? "_blank" : undefined}
      rel={props.href.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  strong: (props: any) => (
    <strong className="font-bold text-[16px] text-[#333]" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-disc pl-10 my-4 space-y-2" {...props} />
  ),
  li: (props: any) => (
    <li className="mb-2" {...props} />
  ),
};

