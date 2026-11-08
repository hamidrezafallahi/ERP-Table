import styles from './site.module.css';

/** A key combo such as `['Ctrl', 'Shift', 'End']`. */
type Combo = readonly string[];

type Shortcut = {
  /** Alternatives — rendered as «A یا B». */
  keys: readonly Combo[];
  action: string;
};

type ShortcutGroup = {
  id: string;
  title: string;
  items: readonly Shortcut[];
  note?: string;
};

/**
 * Mirrors `infrastructure/ui/UITableKeyboardHandler.ts` (the shortcut list
 * from the newFront erp-table guide). Keep in sync with docs/keyboard.md.
 */
export const SHORTCUT_GROUPS: readonly ShortcutGroup[] = [
  {
    id: 'cell',
    title: 'جابه‌جایی و ویرایش سلول',
    items: [
      {
        keys: [['Enter'], ['Numpad Enter']],
        action:
          'اگر سلول فعالی وجود نداشته باشد، نخستین سلول سطر فعال را فعال می‌کند؛ در غیر این صورت به سلول بعدی می‌رود.',
      },
      { keys: [['Shift', 'Enter']], action: 'به سلول قبلی می‌رود.' },
      { keys: [['Tab']], action: 'با وجود سطر و سلول فعال، به سلول بعدی می‌رود.' },
      {
        keys: [['Shift', 'Tab']],
        action: 'با وجود سطر و سلول فعال، به سلول قبلی می‌رود.',
      },
      {
        keys: [['Arrow Left']],
        action: 'با وجود سطر و سلول فعال، به سلول بعدی می‌رود.',
      },
      {
        keys: [['Arrow Right']],
        action: 'با وجود سطر و سلول فعال، به سلول قبلی می‌رود.',
      },
      {
        keys: [['Arrow Up']],
        action: 'با وجود سطر و سلول فعال، سلول فعال را در همان ستون به بالا می‌برد.',
      },
      {
        keys: [['Arrow Down']],
        action: 'با وجود سطر و سلول فعال، سلول فعال را در همان ستون به پایین می‌برد.',
      },
    ],
    note:
      'جهت حرکت بین سلول‌ها همان next و prev موتور جدول است؛ در نتیجه الزاماً با جهت بصری فلش چپ و راست یکی نیست.',
  },
  {
    id: 'row',
    title: 'انتخاب و جابه‌جایی سطر',
    items: [
      {
        keys: [['Ctrl', 'Space']],
        action: 'انتخاب سطر فعال را تغییر می‌دهد (انتخاب یا لغو انتخاب).',
      },
      {
        keys: [['Shift', 'End']],
        action: 'انتخاب سطر فعال را تغییر می‌دهد (انتخاب یا لغو انتخاب).',
      },
      {
        keys: [['Ctrl', 'Shift', 'End']],
        action: 'از سطر فعال تا آخر، سطرها را انتخاب می‌کند.',
      },
      { keys: [['Ctrl', 'Arrow Up']], action: 'سطر فعال را به بالا جابه‌جا می‌کند.' },
      { keys: [['Ctrl', 'Arrow Down']], action: 'سطر فعال را به پایین جابه‌جا می‌کند.' },
      {
        keys: [['Alt', 'Arrow Up']],
        action: 'سطرهای انتخاب‌شده را به بالا جابه‌جا می‌کند؛ باید سطری انتخاب شده باشد.',
      },
      {
        keys: [['Alt', 'Arrow Down']],
        action: 'سطرهای انتخاب‌شده را به پایین جابه‌جا می‌کند؛ باید سطری انتخاب شده باشد.',
      },
    ],
  },
  {
    id: 'table',
    title: 'عملیات سطر و جدول',
    items: [
      { keys: [['Alt', 'N']], action: 'یک سطر خالی اضافه و آن را فعال می‌کند.' },
      { keys: [['Alt', 'D']], action: 'سطر فعال را کپی می‌کند؛ وجود سطر فعال لازم است.' },
      {
        keys: [['Alt', 'Delete']],
        action: 'سطر فعال را حذف می‌کند؛ وجود سطر فعال لازم است.',
      },
      { keys: [['Alt', 'Arrow Left']], action: 'همهٔ سطرهای بازشده را می‌بندد.' },
      { keys: [['Alt', 'C']], action: 'حالت کپی جدول را فعال می‌کند.' },
      { keys: [['Alt', 'X']], action: 'حالت برش جدول را فعال می‌کند.' },
      { keys: [['Alt', 'V']], action: 'حالت چسباندن جدول را فعال می‌کند.' },
      { keys: [['Alt', 'B']], action: 'حالت چسباندن به‌صورت درج را فعال می‌کند.' },
      { keys: [['Escape']], action: 'کنش جاری جدول را پاک می‌کند.' },
    ],
  },
  {
    id: 'paging',
    title: 'صفحه‌بندی',
    items: [
      {
        keys: [['Page Up']],
        action: 'به صفحهٔ قبلی می‌رود؛ اگر صفحهٔ قبلی وجود نداشته باشد کاری نمی‌کند.',
      },
      {
        keys: [['Page Down']],
        action: 'به صفحهٔ بعدی می‌رود؛ اگر صفحهٔ بعدی وجود نداشته باشد کاری نمی‌کند.',
      },
    ],
  },
];

const NOTES = [
  'Ctrl و Alt بر اساس کلیدهای اصلاح‌کنندهٔ مرورگر تعریف شده‌اند؛ Meta (کلید ⌘) جایگزین Ctrl نیست.',
  'میانبرهای وابسته به سطر فقط وقتی اجرا می‌شوند که سطر فعال پیدا شود. اگر focus داخل کنترل انتخاب باشد، گرید برای یافتن سطر فعال از وضعیت موتور و سپس سطر انتخاب‌شده کمک می‌گیرد.',
  'میانبرهای Tab و فلش‌ها فقط وقتی به حرکت سلول منجر می‌شوند که سطر و ستون فعال موجود باشند.',
] as const;

function KeyCombo({ combo }: { combo: Combo }) {
  return (
    <span className={styles.keyCombo} dir="ltr">
      {combo.map((key, i) => (
        <span key={key} className={styles.keyComboPart}>
          {i > 0 && (
            <span className={styles.keyPlus} aria-hidden>
              +
            </span>
          )}
          <kbd className={styles.kbd}>{key}</kbd>
        </span>
      ))}
    </span>
  );
}

export function KeyboardShortcuts() {
  return (
    <>
      <p>
        وقتی focus داخل گرید است، این میانبرها ورود داده را بدون ماوس ممکن می‌کنند. همه از{' '}
        <code>UITableKeyboardHandler</code> می‌آیند و در گرید زندهٔ بالای همین صفحه قابل
        امتحان‌اند.
      </p>

      {SHORTCUT_GROUPS.map((group) => (
        <section
          key={group.id}
          className={styles.shortcutGroup}
          aria-labelledby={`shortcuts-${group.id}`}
        >
          <h3 id={`shortcuts-${group.id}`} className={styles.shortcutGroupTitle}>
            {group.title}
            <span className={styles.shortcutCount}>{group.items.length}</span>
          </h3>
          <div className={styles.shortcutTableWrap}>
            <table className={styles.shortcutTable}>
              <thead>
                <tr>
                  <th scope="col">میانبر</th>
                  <th scope="col">عملکرد</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.keys.map((c) => c.join('+')).join('|')}>
                    <td className={styles.shortcutKeys}>
                      {item.keys.map((combo, i) => (
                        <span key={combo.join('+')} className={styles.keyAlt}>
                          {i > 0 && <span className={styles.keyOr}>یا</span>}
                          <KeyCombo combo={combo} />
                        </span>
                      ))}
                    </td>
                    <td>{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {group.note && <p className={styles.shortcutNote}>{group.note}</p>}
        </section>
      ))}

      <h3 className={styles.shortcutGroupTitle}>نکته‌ها</h3>
      <ul className={styles.shortcutNotes}>
        {NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </>
  );
}
