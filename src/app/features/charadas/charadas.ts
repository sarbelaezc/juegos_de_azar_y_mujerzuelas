import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CHARADES_WORDS, CharadesDifficulty } from './charades-words';
import { SiteHeader } from '../../shared/site-header/site-header';

const DIFFICULTIES: readonly CharadesDifficulty[] = ['facil', 'intermedio', 'dificil'];

@Component({
  selector: 'app-charadas',
  imports: [SiteHeader],
  templateUrl: './charadas.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Charadas {
  protected readonly difficulties = [
    { value: 'facil', label: 'Fácil', description: 'Ideas cotidianas para entrar en calor.' },
    {
      value: 'intermedio',
      label: 'Intermedio',
      description: 'Personajes, acciones y situaciones conocidas.',
    },
    { value: 'dificil', label: 'Difícil', description: 'Conceptos y retos para expertos.' },
  ] as const;

  protected readonly difficulty = signal<CharadesDifficulty>('facil');
  protected readonly started = signal(false);
  protected readonly currentWord = signal<string | null>(null);
  protected readonly revealed = signal(false);
  protected readonly currentWordWasRevealed = signal(false);
  protected readonly wordsLeft = signal<string[]>([]);
  protected readonly remainingCount = computed(() => this.wordsLeft().length);
  protected readonly bankSize = computed(() => CHARADES_WORDS[this.difficulty()].length);

  protected setDifficulty(value: string): void {
    if (!DIFFICULTIES.includes(value as CharadesDifficulty)) {
      return;
    }

    this.difficulty.set(value as CharadesDifficulty);
  }

  protected startGame(): void {
    this.started.set(true);
    this.wordsLeft.set([...CHARADES_WORDS[this.difficulty()]]);
    this.drawWord();
  }

  protected revealWord(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    this.capturePointer(event);
    if (this.currentWord()) {
      this.revealed.set(true);
      this.currentWordWasRevealed.set(true);
    }
  }

  protected revealWordWithKeyboard(event: KeyboardEvent): void {
    if (event.key !== ' ' && event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    if (this.currentWord()) {
      this.revealed.set(true);
      this.currentWordWasRevealed.set(true);
    }
  }

  protected hideWord(): void {
    this.revealed.set(false);
  }

  protected hideWordWithKeyboard(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      this.hideWord();
    }
  }

  protected nextWord(): void {
    if (!this.currentWordWasRevealed()) {
      return;
    }

    this.drawWord();
  }

  protected restartGame(): void {
    this.startGame();
  }

  protected backToSetup(): void {
    this.started.set(false);
    this.currentWord.set(null);
    this.revealed.set(false);
    this.currentWordWasRevealed.set(false);
    this.wordsLeft.set([]);
  }

  private drawWord(): void {
    const words = this.wordsLeft();
    if (words.length === 0) {
      this.currentWord.set(null);
      this.revealed.set(false);
      this.currentWordWasRevealed.set(false);
      return;
    }

    const index = Math.floor(Math.random() * words.length);
    this.currentWord.set(words[index]);
    this.revealed.set(false);
    this.currentWordWasRevealed.set(false);
    this.wordsLeft.set(words.filter((_, wordIndex) => wordIndex !== index));
  }

  private capturePointer(event: PointerEvent): void {
    const target = event.currentTarget;
    if (
      typeof event.pointerId === 'number' &&
      target instanceof HTMLElement &&
      typeof target.setPointerCapture === 'function'
    ) {
      target.setPointerCapture(event.pointerId);
    }
  }
}
