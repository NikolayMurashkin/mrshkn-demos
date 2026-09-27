import { serializeJsonLd } from '../../schema';

type JsonLdProps = {
  data: object;
};

export const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
  />
);
