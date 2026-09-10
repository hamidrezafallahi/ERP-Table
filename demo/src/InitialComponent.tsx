import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { LiveGridPreview } from './LiveGridPreview';
import { ensureLink, ensureMeta } from './seo';
import {
  AUTHOR_URL,
  GITHUB_URL,
  INSTALL_CMD,
  NPM_URL,
  PACKAGE_NAME,
  SITE_URL,
  THEME_COLOR,
} from './site';
import styles from './site.module.css';

const SECTION_KEYS = [
  'intro',
  'grid',
  'keyboard',
  'virtual',
  'plugins',
  'compose',
] as const;

type SectionKey = (typeof SECTION_KEYS)[number];

type SectionContent = {
  title: string;
  desc: ReactNode;
};

const SEO = {
  title: 'گرید داده فارسی React | دیتاگرید جلالی با کیبورد اکسل',
  description:
    'دیتاگرید فارسی و جلالی برای React — RTL، ناوبری کیبورد شبیه Excel، Virtual Scroll، IndexedDB و خروجی Excel/PDF. مناسب فرم‌های سازمانی.',
  h1: 'گرید دادهٔ فارسی برای React',
  lead:
    'یک Data Grid سازمانی با پشتیبانی بومی RTL و تاریخ شمسی: سلول‌های قابل‌ویرایش، ناوبری کیبورد شبیه Excel، اسکرول مجازی، ذخیرهٔ آفلاین و پلاگین Excel/PDF.',
  docs: 'مستندات زنده',
  live: 'Live',
  features: ['RTL + جلالی', 'کیبورد Excel', 'Virtual scroll', 'Excel / PDF'],
  ctaDocs: 'شروع از معرفی',
  ctaNpm: 'مشاهده در npm',
  ctaGithub: 'سورس در GitHub',
  previewLabel: 'آناتومی گرید',
  heroArt: {
    caption: 'سلول فعال · کیبورد Excel',
    cols: ['ردیف', 'سرفصل', 'بدهکار', 'بستانکار'],
    rows: [
      ['۱', 'موجودی بانک', '۱۰٬۰۰۰٬۰۰۰', '—'],
      ['۲', 'اسناد دریافتنی', '—', '۱۰٬۰۰۰٬۰۰۰'],
      ['۳', 'حساب‌های پرداختنی', '۲٬۴۵۰٬۰۰۰', '—'],
    ],
    stats: [
      { k: 'RTL', v: 'جلالی از ابتدا' },
      { k: 'Keys', v: '↑ ↓ Tab Enter' },
      { k: 'Scale', v: 'VirtualList' },
    ],
  },
  liveGalleryTitle: 'گرید زنده',
  liveGalleryLead:
    'گرید منتشرشده — ردیف، سلول، تاریخ شمسی و ناوبری صفحه‌بندی.',
  liveLabels: {
    grid: 'جدول اقلام سند',
    keyboard: 'کیبورد Excel',
    virtual: 'VirtualList',
    plugins: 'Excel / PDF',
  },
  copied: 'کپی شد',
  copy: 'کپی',
  highlightsTitle: 'چرا این گرید؟',
  highlights: [
    {
      title: 'گرید واقعی سازمانی',
      text: 'همان ظاهر و رفتار فرم‌های سازمانی: ردیف عملیات، سلول قیمت، تاریخ جلالی و صفحه‌بندی.',
    },
    {
      title: 'کیبورد شبیه Excel',
      text: 'پیمایش سلول با جهت‌نما، Tab و Enter — مناسب ورود دادهٔ سریع در حسابداری و انبار.',
    },
    {
      title: 'هزاران ردیف',
      text: 'VirtualList فقط ردیف‌های نمایان را رندر می‌کند؛ ذخیرهٔ رویدادمحور در IndexedDB.',
    },
  ],
} as const;

function Tick() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      aria-hidden
      style={{ marginInlineEnd: 6, verticalAlign: '-2px' }}
    >
      <path
        d="M2.4 8.4 6.1 12 13.6 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TEXT: Record<SectionKey, SectionContent> = {
  intro: {
        title: 'معرفی کتابخانه',
        desc: (
          <>
            <p>
              <code>{PACKAGE_NAME}</code> یک <strong>Data Grid</strong> برای فرم‌های
              سازمانی فارسی است — نه یک جدول HTML ساده. ردیف، سلول، ستون ایندکس،
              تاریخ شمسی، ناوبری کیبورد و صفحه‌بندی را یکجا می‌دهد.
            </p>
            <p>
              سطح منتشرشده همان کامپوننت گرید است؛ برای کنترل پیشرفته
              هم composition root در دسترس است.
            </p>
            <h3>
              <Tick /> مناسب فرم‌های سازمانی
            </h3>
            <p>
              الگوی اقلام سند، چک، انبار و برداشت بانکی: ستون عملیات ردیف، مبلغ
              بدهکار/بستانکار، و سلول تاریخ جلالی.
            </p>
            <h3>
              <Tick /> RTL از ابتدا
            </h3>
            <p>
              جهت راست‌به‌چپ و تقویم شمسی بخشی از گرید هستند، نه یک پوستهٔ بعد از
              میلادی.
            </p>
          </>
        ),
      },
      grid: {
        title: 'گرید',
        desc: (
          <>
            <p>
              کامپوننت اصلی: یک گرید React با ردیف، سلول و صفحه‌بندی. سلول را ویرایش کنید،
              ردیف اضافه کنید، بین صفحات جابه‌جا شوید.
            </p>
            <pre className={styles.stageCode}>{`import { ERPTable } from 'persian-data-grid';

<ERPTable
  store="erp"
  tableKey={pageId}
  actor={actor}
  columns={columns}
  rows={rows}
  tableHeight={420}
  multiSelectConfig={multiSelectConfig}
  onReady={setController}
/>`}</pre>
          </>
        ),
      },
      keyboard: {
        title: 'کیبورد Excel',
        desc: (
          <>
            <p>
              ورود داده در فرم‌های سازمانی با ماوس کند است. گرید از ناوبری سلول شبیه Excel /
              IDE پشتیبانی می‌کند:
            </p>
            <ul>
              <li>جهت‌نما: سلول بعدی / قبلی / بالا / پایین</li>
              <li>Tab و Enter برای حرکت در ردیف و ستون</li>
              <li>Undo روی تغییرات سلول</li>
            </ul>
            <p>
              در playground می‌توانید VirtualList را با کیبورد هم تست کنید:
              <code> npm run dev </code>
            </p>
          </>
        ),
      },
      virtual: {
        title: 'VirtualList',
        desc: (
          <>
            <p>
              برای ده‌ها هزار ردیف، <code>VirtualList</code> فقط پنجرهٔ نمایان را
              رندر می‌کند — آداپتر React روی ViewportCalculator.
            </p>
            <pre className={styles.stageCode}>{`import { createERPTable, VirtualList } from 'persian-data-grid';

const grid = await createERPTable({ /* … */ });

<VirtualList
  session={grid.session}
  items={rows}
  height={360}
  rowHeight={44}
  renderItem={(row) => <Row row={row} />}
/>`}</pre>
          </>
        ),
      },
      plugins: {
        title: 'Excel / PDF',
        desc: (
          <>
            <p>
              خروجی روی stream نما است؛ دامنه mutate نمی‌شود.
            </p>
            <pre className={styles.stageCode}>{`await grid.pluginHost.requestExport({ format: 'xlsx' });
await grid.pluginHost.requestExport({ format: 'pdf' });`}</pre>
          </>
        ),
      },
      compose: {
        title: 'ترکیب گرید',
        desc: (
          <>
            <p>
              اگر UI میزبان خودتان را می‌سازید، composition root همهٔ session،
              engine و plugin host را برمی‌گرداند.
            </p>
            <pre className={styles.stageCode}>{`const grid = await createERPTable({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columns,
  rows,
});`}</pre>
          </>
        ),
      },
};

export function InitialComponent() {
  const [activeSection, setActiveSection] = useState<SectionKey>('intro');
  const [copied, setCopied] = useState(false);
  const seo = SEO;
  const sections = TEXT;
  const active = sections[activeSection];

  const jsonLd = useMemo(
    () =>
      JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Persian Data Grid for React',
          alternateName: PACKAGE_NAME,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web',
          softwareVersion: '0.5.0',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          description: seo.description,
          url: SITE_URL,
          downloadUrl: NPM_URL,
          codeRepository: GITHUB_URL,
          license: 'https://opensource.org/licenses/MIT',
          author: {
            '@type': 'Person',
            name: 'Hamidreza Fallahi',
            url: AUTHOR_URL,
          },
          sameAs: [NPM_URL, GITHUB_URL],
          programmingLanguage: ['TypeScript', 'JavaScript'],
          keywords:
            'persian data grid, react data grid, jalali grid, گرید فارسی react',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Persian Data Grid for React',
          url: SITE_URL,
          inLanguage: ['fa-IR'],
          description: seo.description,
        },
      ]),
    [seo.description],
  );

  useEffect(() => {
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
    document.title = seo.title;

    ensureMeta('description', seo.description);
    ensureMeta(
      'keywords',
      'گرید فارسی react, دیتاگرید شمسی, data grid jalali, persian data grid, virtual scroll',
    );
    ensureMeta('robots', 'index,follow,max-image-preview:large');
    ensureMeta('theme-color', THEME_COLOR);

    ensureMeta('og:title', seo.title, 'property');
    ensureMeta('og:description', seo.description, 'property');
    ensureMeta('og:type', 'website', 'property');
    ensureMeta('og:url', SITE_URL, 'property');
    ensureMeta('og:site_name', 'Persian Data Grid for React', 'property');
    ensureMeta('og:locale', 'fa_IR', 'property');

    ensureMeta('twitter:card', 'summary_large_image');
    ensureMeta('twitter:title', seo.title);
    ensureMeta('twitter:description', seo.description);

    ensureLink('canonical', SITE_URL);
  }, [seo.description, seo.title]);

  useEffect(() => {
    const id = 'pdg-software-jsonld';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = jsonLd;
  }, [jsonLd]);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`${styles.page} ${styles.pageFa}`}>
      <a className={styles.srOnly} href="#main-docs">
        پرش به محتوا
      </a>

      <div className={styles.shell}>
        <header className={styles.topbar}>
          <a className={styles.brandMark} href={SITE_URL} aria-label={PACKAGE_NAME}>
            <span className={styles.logo} aria-hidden />
            <span className={styles.brandText}>
              <span className={styles.brandName}>گرید داده فارسی</span>
              <span className={styles.brandSub}>{PACKAGE_NAME}</span>
            </span>
          </a>

          <div className={styles.topActions}>
            <a className={styles.linkBtn} href={`${SITE_URL}guide/`}>
              راهنما
            </a>
            <a className={styles.linkBtn} href={NPM_URL} target="_blank" rel="noreferrer">
              npm
            </a>
            <a className={styles.linkBtn} href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </header>

        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>Data Grid · RTL · React</p>
              <h1 id="hero-title" className={styles.h1}>
                {seo.h1}
              </h1>
              <p className={styles.lead}>{seo.lead}</p>

              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={`${styles.cta} ${styles.ctaPrimary}`}
                  onClick={() => {
                    setActiveSection('intro');
                    document.getElementById('live-demo')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  {seo.ctaDocs}
                </button>
                <a
                  className={`${styles.cta} ${styles.ctaGhost}`}
                  href={NPM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {seo.ctaNpm}
                </a>
                <a
                  className={`${styles.cta} ${styles.ctaGhost}`}
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {seo.ctaGithub}
                </a>
              </div>

              <div className={styles.installRow}>
                <code className={styles.install}>{INSTALL_CMD}</code>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={copyInstall}
                  aria-label={seo.copy}
                >
                  {copied ? seo.copied : seo.copy}
                </button>
              </div>

              <div className={styles.chips} aria-label="features">
                {seo.features.map((item) => (
                  <span key={item} className={styles.chip}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <aside className={styles.heroStage} aria-label={seo.previewLabel}>
              <div className={styles.stageChrome}>
                <span className={styles.stageDot} />
                <span className={styles.stageDot} />
                <span className={styles.stageDot} />
                <span className={styles.stageLabel}>{seo.previewLabel}</span>
              </div>
              <div className={styles.heroArt}>
                <div className={styles.heroMock} dir="rtl">
                  <div className={styles.heroMockHead}>
                    {seo.heroArt.cols.map((col) => (
                      <span key={col}>{col}</span>
                    ))}
                  </div>
                  {seo.heroArt.rows.map((row, rowIdx) => (
                    <div
                      key={row[0]}
                      className={`${styles.heroMockRow} ${
                        rowIdx === 0 ? styles.heroMockRowActive : ''
                      }`}
                    >
                      {row.map((cell, cellIdx) => (
                        <span
                          key={`${row[0]}-${cellIdx}`}
                          className={
                            rowIdx === 0 && cellIdx === 1
                              ? styles.heroMockCellActive
                              : undefined
                          }
                        >
                          {cell}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <p className={styles.heroArtCaption}>{seo.heroArt.caption}</p>
                <div className={styles.heroStats}>
                  {seo.heroArt.stats.map((item) => (
                    <div key={item.k} className={styles.heroStat}>
                      <span className={styles.heroStatK}>{item.k}</span>
                      <span className={styles.heroStatV}>{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className={styles.heroDemo} id="live-demo">
            <div className={styles.heroDemoHead}>
              <div>
                <h2 className={styles.heroDemoTitle}>{seo.liveGalleryTitle}</h2>
                <p className={styles.heroDemoLead}>{seo.liveGalleryLead}</p>
              </div>
              <span className={styles.liveBadge}>
                <span className={styles.liveDot} aria-hidden />
                {seo.live}
              </span>
            </div>
            <LiveGridPreview
              tableKey="demo-landing-gallery"
              tableHeight={400}
              tableTitle="اقلام سند"
              showToolbar
            />
          </div>
        </section>

        <section className={styles.liveGallery} aria-label={seo.liveLabels.keyboard}>
          <div className={styles.liveFeatureGrid}>
            <article className={styles.liveCard}>
              <header className={styles.liveCardHead}>
                <h3>{seo.liveLabels.keyboard}</h3>
                <button
                  type="button"
                  className={styles.liveCardLink}
                  onClick={() => setActiveSection('keyboard')}
                >
                  {sections.keyboard.title}
                </button>
              </header>
              <p className={styles.liveCardText}>
                جهت‌نما، Tab و Enter بین سلول‌های گرید — ورود داده شبیه Excel.
              </p>
            </article>
            <article className={styles.liveCard}>
              <header className={styles.liveCardHead}>
                <h3>{seo.liveLabels.virtual}</h3>
                <button
                  type="button"
                  className={styles.liveCardLink}
                  onClick={() => setActiveSection('virtual')}
                >
                  {sections.virtual.title}
                </button>
              </header>
              <p className={styles.liveCardText}>
                فقط ردیف‌های داخل viewport رندر می‌شوند — مناسب لیست‌های خیلی بلند.
              </p>
            </article>
            <article className={styles.liveCard}>
              <header className={styles.liveCardHead}>
                <h3>{seo.liveLabels.plugins}</h3>
                <button
                  type="button"
                  className={styles.liveCardLink}
                  onClick={() => setActiveSection('plugins')}
                >
                  {sections.plugins.title}
                </button>
              </header>
              <p className={styles.liveCardText}>
                خروجی xlsx و pdf از روی نمای فعلی گرید، بدون تغییر دامنه.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.highlights} aria-labelledby="highlights-title">
          <h2 id="highlights-title" className={styles.highlightsTitle}>
            {seo.highlightsTitle}
          </h2>
          <div className={styles.highlightGrid}>
            {seo.highlights.map((item) => (
              <article key={item.title} className={styles.highlightCard}>
                <h3 className={styles.highlightName}>{item.title}</h3>
                <p className={styles.highlightText}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.layout}>
          <nav className={styles.side} aria-label={seo.docs}>
            <p className={styles.sideLabel}>{seo.docs}</p>
            {SECTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.navBtn} ${
                  activeSection === key ? styles.navBtnActive : ''
                }`}
                onClick={() => setActiveSection(key)}
                aria-current={activeSection === key ? 'page' : undefined}
              >
                {sections[key].title}
              </button>
            ))}
          </nav>

          <main id="main-docs" className={styles.main}>
            <article className={styles.panel} key={activeSection}>
              <h2 className={styles.sectionTitle}>{active.title}</h2>
              <div className={styles.bodyCopy}>{active.desc}</div>
            </article>

            <footer className={styles.footer}>
              <span>
                MIT · ساخته‌شده توسط{' '}
                <a href={AUTHOR_URL} target="_blank" rel="noreferrer">
                  Hamidreza Fallahi
                </a>
              </span>
              <span>
                <a href={NPM_URL} target="_blank" rel="noreferrer">
                  npm
                </a>
                {' · '}
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                {' · '}
                <a href={`${GITHUB_URL}#readme`} target="_blank" rel="noreferrer">
                  README
                </a>
              </span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
