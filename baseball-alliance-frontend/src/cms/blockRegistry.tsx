import React from "react";

export type BlockRenderProps = {
  blockType: string;
  props: Record<string, unknown>;
};

function RichTextBlock({ props }: BlockRenderProps) {
  const html = typeof props.html === "string" ? props.html : "";
  if (!html) return null;
  return (
    <div
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ImageBlock({ props }: BlockRenderProps) {
  const url = typeof props.url === "string" ? props.url : "";
  const alt = typeof props.alt === "string" ? props.alt : "";
  if (!url) return null;
  return (
    <figure className="my-6">
      <img src={url} alt={alt} className="w-full rounded-xl object-cover" />
    </figure>
  );
}

function HeadingBlock({ props }: BlockRenderProps) {
  const text = typeof props.text === "string" ? props.text : "";
  if (!text) return null;
  const level = typeof props.level === "number" ? props.level : 2;
  const cls = "font-bold text-[#163968] mt-8 mb-3";
  if (level === 1) return <h1 className={cls}>{text}</h1>;
  if (level === 3) return <h3 className={cls}>{text}</h3>;
  return <h2 className={cls}>{text}</h2>;
}

const registry: Record<string, React.FC<BlockRenderProps>> = {
  richText: RichTextBlock,
  image: ImageBlock,
  heading: HeadingBlock,
};

export function renderCmsBlock(
  blockType: string,
  props: Record<string, unknown>
) {
  const Cmp = registry[blockType] ?? RichTextBlock;
  return <Cmp blockType={blockType} props={props} />;
}

export const CMS_BLOCK_TYPES = ["richText", "image", "heading"] as const;
