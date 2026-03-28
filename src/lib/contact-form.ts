/**
 * contact-form.ts — Form validation, mailto builder, and endpoint submission
 * for the Contact page.
 */

export interface FormData {
  type: string;
  name: string;
  company: string;
  email: string;
  message: string;
}

export interface ValidationError {
  field: string;
  errorId: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate all required fields in the contact form.
 * Returns an empty array when the form is valid.
 */
export function validateForm(form: HTMLFormElement): ValidationError[] {
  const errors: ValidationError[] = [];

  const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value;
  const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value.trim();
  const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value.trim();
  const message = (form.querySelector('[name="message"]') as HTMLTextAreaElement)?.value.trim();
  const privacy = (form.querySelector('[name="privacy"]') as HTMLInputElement)?.checked;

  if (!type) {
    errors.push({ field: 'type', errorId: 'error-type', message: 'ご相談内容を選択してください' });
  }
  if (!name) {
    errors.push({ field: 'name', errorId: 'error-name', message: 'お名前を入力してください' });
  }
  if (!email) {
    errors.push({ field: 'email', errorId: 'error-email', message: 'メールアドレスを入力してください' });
  } else if (!EMAIL_RE.test(email)) {
    errors.push({ field: 'email', errorId: 'error-email', message: '正しいメールアドレスを入力してください' });
  }
  if (!message) {
    errors.push({ field: 'message', errorId: 'error-message', message: 'メッセージを入力してください' });
  }
  if (!privacy) {
    errors.push({ field: 'privacy', errorId: 'error-privacy', message: '個人情報の取り扱いへの同意が必要です' });
  }

  return errors;
}

/**
 * Show validation errors on the form: set `is-invalid` class, `aria-invalid`,
 * and populate the per-field error spans.
 */
export function showErrors(form: HTMLFormElement, errors: ValidationError[]): void {
  for (const { field, errorId, message } of errors) {
    const el = form.querySelector(`[name="${field}"]`) as HTMLElement | null;
    if (el) {
      el.classList.add('is-invalid');
      el.setAttribute('aria-invalid', 'true');
    }
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.hidden = false;
    }
  }
}

/**
 * Clear all validation errors from the form: remove `is-invalid` class,
 * reset `aria-invalid`, and hide per-field error spans.
 */
export function clearErrors(form: HTMLFormElement): void {
  form.querySelectorAll('.contact-form__error').forEach((el) => {
    (el as HTMLElement).hidden = true;
    (el as HTMLElement).textContent = '';
  });
  form.querySelectorAll('.is-invalid').forEach((el) => {
    el.classList.remove('is-invalid');
    el.setAttribute('aria-invalid', 'false');
  });
}

/**
 * Extract typed FormData from the form element.
 */
export function extractFormData(form: HTMLFormElement): FormData {
  return {
    type: (form.querySelector('[name="type"]') as HTMLSelectElement).value,
    name: (form.querySelector('[name="name"]') as HTMLInputElement).value.trim(),
    email: (form.querySelector('[name="email"]') as HTMLInputElement).value.trim(),
    company: (form.querySelector('[name="company"]') as HTMLInputElement).value.trim(),
    message: (form.querySelector('[name="message"]') as HTMLTextAreaElement).value.trim(),
  };
}

/**
 * Build a mailto: URL for the fallback (no API endpoint).
 */
export function buildMailtoUrl(data: FormData): string {
  const subject = `【お問い合わせ】${data.type}`;
  const body = [
    `■ ご相談内容: ${data.type}`,
    `■ お名前: ${data.name}`,
    `■ メールアドレス: ${data.email}`,
    data.company ? `■ 会社名: ${data.company}` : '',
    '',
    data.message,
  ]
    .filter(Boolean)
    .join('\n');

  return `mailto:info@archi-prisma.co.jp?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * POST form data to an API endpoint (e.g. GAS).
 */
export async function submitToEndpoint(
  endpoint: string,
  data: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
