import { useMemo, useState, type ReactNode } from 'react';

import styles from './site.module.css';

const INSTALL_CMD = 'npm i @fallahi/erp-table';
const DOCS_PUBLIC = '../docs/public-api.md';

const SECTION_KEYS = [
  'intro',
  'compose',
  'virtual',
  'plugins',
  'publish',
] as const;

type SectionKey = (typeof SECTION_KEYS)[number];

const COPY = {
  fa: {
    brand: 'جدول ERP رویدادمحور',
    brandSub: '@fallahi/erp-table',
    h1: 'گرید ERP با Event Sourcing و Virtual Scroll',
    lead:
      'هستهٔ جدول برای فرم‌های سازمانی: createERPTable، GridSession، VirtualList، changelog و export پلاگین — بدون قفل شدن به UI میزبان.',
    features: ['Event-driven', 'VirtualList', 'Excel / PDF plugins', 'Undo stack'],
    ctaDocs: 'شروع از معرفی',
    ctaApi: 'Public API',
    copy: 'کپی',
    copied: 'کپی شد',
    highlightsTitle: 'چرا این کتابخانه؟',
    highlights: [
      {
        title: 'Composition root تمیز',
        text: 'createERPTable همهٔ engine، session، event store و plugin host را یک‌جا می‌سازد.',
      },
      {
        title: 'Virtualization واقعی',
        text: 'VirtualList فقط ردیف‌های نمایان را رندر می‌کند — مناسب ده‌ها هزار ردیف.',
      },
      {
        title: 'Export بدون mutate دامنه',
        text: 'Excel/PDF روی view stream؛ aggregate دامنه دست‌نخورده می‌ماند.',
      },
    ],
    docs: 'مستندات زنده',
    sections: {
      intro: {
        title: 'معرفی',
        body: (
          <>
            <p>
              <code>@fallahi/erp-table</code> هستهٔ گرید ERP است: رویدادمحور، DDD، و آمادهٔ
              publish. سطح منتشرشده از <code>publish/entry.ts</code> می‌آید؛{' '}
              <code>ERPTable</code> میزبان در مونوریپو می‌ماند.
            </p>
            <p>
              برای توسعهٔ محلی: <code>npm run dev:docs</code> این صفحه،{' '}
              <code>npm run dev</code> playground تعاملی.
            </p>
          </>
        ),
      },
      compose: {
        title: 'Composition',
        body: (
          <>
            <p>
              با <code>createERPTable</code> یک grid کامل می‌سازید: engine، controller، session،
              changelog و pluginHost.
            </p>
            <pre className={styles.stageCode}>{`const grid = await createERPTable({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columns: [/* ColumnSchema */],
  rows: [/* RowInput */],
});`}</pre>
          </>
        ),
      },
      virtual: {
        title: 'VirtualList',
        body: (
          <>
            <p>
              آداپتر React روی <code>ViewportCalculator</code>. فقط spacer + ردیف‌های visible.
            </p>
            <p>
              جزئیات: <code>docs/public-api.md</code> و <code>docs/components.md</code>.
            </p>
          </>
        ),
      },
      plugins: {
        title: 'Plugins',
        body: (
          <>
            <p>
              <code>ExcelExportPlugin</code> و <code>PdfExportPlugin</code> روی{' '}
              <code>EXPORT_REQUESTED</code> کار می‌کنند.
            </p>
            <p>
              <code>await grid.pluginHost.requestExport({'{'} format: 'xlsx' {'}'})</code>
            </p>
          </>
        ),
      },
      publish: {
        title: 'Build & publish',
        body: (
          <>
            <p>
              <code>npm run build</code> → tsup · <code>npm run verify:dist</code> ·{' '}
              <code>prepublishOnly</code> typecheck + build + verify + test.
            </p>
            <p>Bundler این ریپو tsup است (نه rollup) — الگوی publish از همین‌جا آمده.</p>
          </>
        ),
      },
    },
  },
  en: {
    brand: 'Event-driven ERP Grid',
    brandSub: '@fallahi/erp-table',
    h1: 'ERP grid with event sourcing & virtual scroll',
    lead:
      'Table core for enterprise forms: createERPTable, GridSession, VirtualList, changelog, and export plugins — without locking to host UI.',
    features: ['Event-driven', 'VirtualList', 'Excel / PDF plugins', 'Undo stack'],
    ctaDocs: 'Read introduction',
    ctaApi: 'Public API',
    copy: 'Copy',
    copied: 'Copied',
    highlightsTitle: 'Why this library?',
    highlights: [
      {
        title: 'Clean composition root',
        text: 'createERPTable wires engine, session, event store, and plugin host in one place.',
      },
      {
        title: 'Real virtualization',
        text: 'VirtualList renders only visible rows — built for tens of thousands of lines.',
      },
      {
        title: 'Export without mutating domain',
        text: 'Excel/PDF ride the view stream; domain aggregates stay untouched.',
      },
    ],
    docs: 'Live docs',
    sections: {
      intro: {
        title: 'Introduction',
        body: (
          <>
            <p>
              <code>@fallahi/erp-table</code> is an event-driven ERP grid core. The published
              surface is <code>publish/entry.ts</code>; host <code>ERPTable</code> stays in the
              monorepo.
            </p>
            <p>
              Local modes: <code>npm run dev:docs</code> for this landing,{' '}
              <code>npm run dev</code> for the QA playground.
            </p>
          </>
        ),
      },
      compose: {
        title: 'Composition',
        body: (
          <>
            <p>
              Use <code>createERPTable</code> to bootstrap engine, controller, session, changelog,
              and pluginHost.
            </p>
            <pre className={styles.stageCode}>{`const grid = await createERPTable({
  store: 'erp',
  tableKey: 'voucher-1',
  actor: { userId: 'u1', roles: ['admin'] },
  columns: [/* ColumnSchema */],
  rows: [/* RowInput */],
});`}</pre>
          </>
        ),
      },
      virtual: {
        title: 'VirtualList',
        body: (
          <>
            <p>
              React adapter over <code>ViewportCalculator</code> — spacers + visible rows only.
            </p>
            <p>
              See <code>docs/public-api.md</code> and <code>docs/components.md</code>.
            </p>
          </>
        ),
      },
      plugins: {
        title: 'Plugins',
        body: (
          <>
            <p>
              <code>ExcelExportPlugin</code> / <code>PdfExportPlugin</code> listen for{' '}
              <code>EXPORT_REQUESTED</code>.
            </p>
            <p>
              <code>await grid.pluginHost.requestExport({'{'} format: 'xlsx' {'}'})</code>
            </p>
          </>
        ),
      },
      publish: {
        title: 'Build & publish',
        body: (
          <>
            <p>
              <code>npm run build</code> (tsup) · <code>verify:dist</code> ·{' '}
              <code>prepublishOnly</code> runs typecheck + build + verify + test.
            </p>
          </>
        ),
      },
    },
  },
} as const;

export function InitialComponent() {
  const [active, setActive] = useState<SectionKey>('intro');
  const [copied, setCopied] = useState(false);
  const t = COPY.en;
  const section = t.sections[active];

  const previewSnippet = useMemo(
    () =>
      `import { createERPTable, VirtualList } from '@fallahi/erp-table';\n\nconst grid = await createERPTable({ /* … */ });`,
    [],
  );

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
    <div className={`${styles.page} ${styles.pageEn}`} dir="ltr">
      <a className={styles.srOnly} href="#main-docs">
        Skip to content
      </a>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brandMark}>
            <span className={styles.logo} aria-hidden />
            <span className={styles.brandText}>
              <span className={styles.brandName}>{t.brand}</span>
              <span className={styles.brandSub}>{t.brandSub}</span>
            </span>
          </div>
          <div className={styles.topActions}>
            <a className={styles.linkBtn} href={DOCS_PUBLIC}>
              docs
            </a>
          </div>
        </header>

        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>DDD · Events · React</p>
              <h1 id="hero-title" className={styles.h1}>
                {t.h1}
              </h1>
              <p className={styles.lead}>{t.lead}</p>
              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={`${styles.cta} ${styles.ctaPrimary}`}
                  onClick={() => setActive('intro')}
                >
                  {t.ctaDocs}
                </button>
                <button
                  type="button"
                  className={`${styles.cta} ${styles.ctaGhost}`}
                  onClick={() => setActive('compose')}
                >
                  {t.ctaApi}
                </button>
              </div>
              <div className={styles.installRow}>
                <code className={styles.install}>{INSTALL_CMD}</code>
                <button type="button" className={styles.copyBtn} onClick={copyInstall}>
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <div className={styles.chips}>
                {t.features.map((f) => (
                  <span key={f} className={styles.chip}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <aside className={styles.heroStage} aria-label="preview">
              <div className={styles.stageChrome}>
                <span className={styles.stageDot} />
                <span className={styles.stageDot} />
                <span className={styles.stageDot} />
                <span className={styles.stageLabel}>createERPTable</span>
              </div>
              <div className={styles.stageBody}>
                <pre className={styles.stageCode}>{previewSnippet}</pre>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.highlights}>
          <h2 className={styles.highlightsTitle}>{t.highlightsTitle}</h2>
          <div className={styles.highlightGrid}>
            {t.highlights.map((item) => (
              <article key={item.title} className={styles.highlightCard}>
                <h3 className={styles.highlightName}>{item.title}</h3>
                <p className={styles.highlightText}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.layout}>
          <nav className={styles.side} aria-label={t.docs}>
            <p className={styles.sideLabel}>{t.docs}</p>
            {SECTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.navBtn} ${active === key ? styles.navBtnActive : ''}`}
                onClick={() => setActive(key)}
              >
                {t.sections[key].title}
              </button>
            ))}
          </nav>
          <main id="main-docs">
            <article className={styles.panel} key={active}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <div className={styles.bodyCopy}>{section.body as ReactNode}</div>
            </article>
            <footer className={styles.footer}>
              <span>UNLICENSED · @fallahi/erp-table</span>
              <span>
                <code>npm run dev</code> = playground · <code>npm run dev:docs</code> = landing
              </span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
