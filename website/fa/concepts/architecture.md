# معماری

لایه‌های `persian-data-grid`:

| لایه | نقش |
|------|-----|
| `domain/` | موجودیت‌ها و دستورها — بدون React/DOM |
| `application/` | نشست، handler، پورت — بدون React/DOM |
| `engine/` | sort / filter / aggregation / selection — توابع خالص |
| `infrastructure/` | IndexedDB، adapter، `GridApi` |
| `ui/` | پوستهٔ React (`DataGrid`) |
| `bootstrap/` | ریشهٔ ترکیب `createGrid` |

هاست معمولاً یکی از این دو را می‌گیرد:

1. **React** — `<DataGrid rowData columnDefs />`
2. **Headless** — `createGrid()` و اتصال نمای خودتان به `session` / `controller`

سطح‌های سنگین اختیاری (Excel، PDF، CSV، adapter آریان، date-picker جلالی) روی **subpath** هستند تا بودجهٔ gzip ریشه حفظ شود.

همچنین ببینید: [Event sourcing](./event-sourcing).
