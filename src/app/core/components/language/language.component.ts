import { Component, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { SelectorComponent } from '../selector/selector.component';
import { AVAILABLE_LANGUAGES, defaultLang, LangCode, Language } from './language.model';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  imports: [SelectorComponent],
})
export class LanguageComponent {
  private readonly _translocoService = inject(TranslocoService);

  private readonly _externalLang = toSignal(this._translocoService.langChanges$, {
    initialValue: this._translocoService.getActiveLang() as LangCode,
  });

  protected readonly availableLangs = signal<readonly Language[]>(AVAILABLE_LANGUAGES);

  protected readonly selectedLang = linkedSignal<LangCode>(
    () => (this._externalLang() as LangCode) ?? defaultLang,
  );

  // constructor() {
  //   effect(() => {
  //     const lang = this.activeLang();
  //     this._translocoService.setActiveLang(lang);
  //     localStorage.setItem('lang', lang);
  //   });
  // }

  // TODO: MAYBE USEFUL USING IT
  private isValidLangCode(langCode: string): langCode is LangCode {
    return AVAILABLE_LANGUAGES.some((lang) => lang.id === langCode);
  }
}
