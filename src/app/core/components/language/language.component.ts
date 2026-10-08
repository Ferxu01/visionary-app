import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { AVAILABLE_LANGUAGES, defaultLang, LangCode, Language } from './language.model';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  imports: [DropdownComponent],
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

  protected readonly currentFlag = computed(() => {
    const selectedLang = this.selectedLang();
    return this.getFlag(selectedLang);
  });

  // constructor() {
  //   effect(() => {
  //     const lang = this.activeLang();
  //     this._translocoService.setActiveLang(lang);
  //     localStorage.setItem('lang', lang);
  //   });
  // }

  protected selectLang(lang: LangCode): void {
    this.selectedLang.set(lang);
  }

  protected getFlag(lang: LangCode): string {
    return `assets/images/flags/${lang.toLowerCase()}.svg`;
  }

  // TODO: MAYBE USEFUL USING IT
  private isValidLangCode(langCode: string): langCode is LangCode {
    return AVAILABLE_LANGUAGES.some((lang) => lang.id === langCode);
  }
}
