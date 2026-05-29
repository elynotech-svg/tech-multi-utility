type StructuredDataProps = {
  data: unknown;
};

export function StructuredData({ data }: StructuredDataProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
