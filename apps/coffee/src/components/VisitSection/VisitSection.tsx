import { MapEmbed } from '@mrshkn/demo-core/components/MapEmbed';
import { VISIT } from '../../consts';
import { DEMO } from '../../demo.config';
import { addressText, hoursRows, phoneHref } from '../../lib/format';
import { Star } from '../Star';
import styles from './VisitSection.module.scss';

/** «Как найти»: адрес, телефон и часы — из данных дела (они же в разметке schema.org), карта — по нажатию. */
export const VisitSection = () => {
  const { address, geo, openingHours, telephone } = DEMO.business;
  const hours = hoursRows(openingHours ?? []);

  return (
    <section
      className={styles.section}
      id="contacts"
      aria-labelledby="contacts-title"
    >
      <h2
        className={styles.title}
        id="contacts-title"
      >
        {VISIT.title}
      </h2>
      <div className={styles.grid}>
        <dl className={styles.card}>
          {address && (
            <div className={styles.fact}>
              <dt className={styles.term}>{VISIT.address}</dt>
              <dd className={styles.address}>{addressText(address)}</dd>
            </div>
          )}
          {telephone && (
            <div className={styles.fact}>
              <dt className={styles.term}>{VISIT.phone}</dt>
              <dd>
                <a
                  className={styles.phone}
                  href={phoneHref(telephone)}
                >
                  {telephone}
                </a>
              </dd>
            </div>
          )}
          {hours.length > 0 && (
            <div className={styles.fact}>
              <dt className={styles.term}>{VISIT.hours}</dt>
              <dd>
                <table className={styles.hours}>
                  <tbody>
                    {hours.map(({ days, time }) => (
                      <tr key={days}>
                        <th scope="row">
                          <span className={styles.days}>{days}</span>
                        </th>
                        <td>{time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dd>
            </div>
          )}
        </dl>
        {geo && (
          <div className={styles.map}>
            <svg
              className={styles.art}
              viewBox="0 0 640 400"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g className={styles.streets}>
                <path d="M0 118 L640 82" />
                <path d="M0 302 L640 268" />
                <path d="M182 0 L228 400" />
                <path d="M468 0 L432 400" />
                <path d="M0 330 L250 0" />
              </g>
              <path
                className={styles.main}
                d="M0 206 L640 184"
              />
            </svg>
            <Star
              className={styles.pin}
              size={56}
            />
            <MapEmbed
              point={geo}
              label={VISIT.map}
            />
          </div>
        )}
      </div>
    </section>
  );
};
